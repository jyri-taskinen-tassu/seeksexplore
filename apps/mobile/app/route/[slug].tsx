import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRoute } from '../../src/api/routes';
import { useDestinationStore } from '../../src/state/useDestinationStore';
import { useUserLocationStore } from '../../src/state/useUserLocationStore';
import { useLocationTracking } from '../../src/lib/useLocationTracking';
import { distanceFromRoute, isOffRoute, haversineDistanceM } from '../../src/lib/geo';
import { MapView, MapCamera, UserLocationMarker, RouteLine } from '../../src/lib/maps/MapProvider';

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center rounded-xl bg-gray-50 px-4 py-2">
      <Text className="text-base font-semibold text-gray-900">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}

export default function RouteDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const destination = useDestinationStore((s) => s.activeDestination);
  const { data: route, isLoading } = useRoute(destination?.id, slug);
  const [tracking, setTracking] = useState(false);

  useLocationTracking(tracking);
  const userLocation = useUserLocationStore((s) => s.location);

  const progress = useMemo(() => {
    if (!tracking || !userLocation || !route) return null;
    const offRoute = isOffRoute(userLocation, route.geometry);
    const distanceToRouteM = distanceFromRoute(userLocation, route.geometry);
    const remainingKm = route.end_location
      ? haversineDistanceM(userLocation, route.end_location) / 1000
      : null;
    return { offRoute, distanceToRouteM, remainingKm };
  }, [tracking, userLocation, route]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!route) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-gray-600">Route not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {route.thumbnail_url ? (
        <Image source={{ uri: route.thumbnail_url }} className="h-48 w-full" resizeMode="cover" />
      ) : (
        <View className="h-48 w-full bg-brand-primary/20" />
      )}

      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-900">{route.name}</Text>
        <Text className="mt-1 capitalize text-gray-500">
          {route.activity_type.replace('_', ' ')} · {route.is_loop ? 'Loop' : 'Point to point'}
        </Text>

        <View className="mt-4 flex-row gap-3">
          <StatPill label="Distance" value={route.distance_km ? `${route.distance_km} km` : '—'} />
          <StatPill
            label="Duration"
            value={route.duration_minutes ? `${Math.round(route.duration_minutes / 60)} h` : '—'}
          />
          <StatPill label="Difficulty" value={route.difficulty} />
          <StatPill label="Elevation" value={route.elevation_gain ? `+${route.elevation_gain} m` : '—'} />
        </View>

        {route.description && <Text className="mt-4 text-base text-gray-700">{route.description}</Text>}

        <View className="mt-4 h-56 overflow-hidden rounded-2xl">
          <MapView>
            <MapCamera
              center={route.start_location ?? undefined}
              zoomLevel={12}
              followUser={tracking}
            />
            <RouteLine id={route.id} geometry={route.geometry} />
            {tracking && <UserLocationMarker />}
          </MapView>
        </View>

        {tracking && progress && (
          <View className="mt-4 rounded-xl bg-gray-50 p-4">
            {progress.offRoute ? (
              <Text className="font-semibold text-amber-700">
                You've left the route ({Math.round(progress.distanceToRouteM)}m away).
              </Text>
            ) : (
              <Text className="font-semibold text-green-700">On route</Text>
            )}
            {progress.remainingKm != null && (
              <Text className="mt-1 text-gray-600">
                ~{progress.remainingKm.toFixed(1)} km to the end
              </Text>
            )}
          </View>
        )}

        <View className="mt-8 mb-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-3">
          <Text className="text-sm text-amber-800">
            Trail conditions can change. You are responsible for your own safety —
            check the weather before you go.
          </Text>
        </View>

        <Pressable
          onPress={() => setTracking((t) => !t)}
          className={`mb-10 items-center rounded-xl py-4 ${tracking ? 'bg-gray-800' : 'bg-brand-primary'}`}
        >
          <Text className="text-base font-bold text-white">
            {tracking ? 'STOP ROUTE' : 'START ROUTE'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
