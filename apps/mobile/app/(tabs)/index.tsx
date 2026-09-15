import { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveDestination } from '../../src/api/destination';
import { useRoutes } from '../../src/api/routes';
import { useDestinationStore } from '../../src/state/useDestinationStore';
import { isSupabaseConfigured } from '../../src/lib/supabase';

function RouteCard({ id, name, distanceKm, difficulty, activityType, onPress }: {
  id: string;
  name: string;
  distanceKm: number | null;
  difficulty: string;
  activityType: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-3 w-56 rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
    >
      <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
        {name}
      </Text>
      <Text className="mt-1 text-sm text-gray-500 capitalize">
        {activityType.replace('_', ' ')} · {difficulty}
      </Text>
      {distanceKm != null && (
        <Text className="mt-1 text-sm text-gray-500">{distanceKm} km</Text>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: destination, isLoading: destinationLoading } = useActiveDestination();
  const setActiveDestination = useDestinationStore((s) => s.setActiveDestination);
  const { data: routes, isLoading: routesLoading } = useRoutes(destination?.id);

  useEffect(() => {
    if (destination) setActiveDestination(destination);
  }, [destination, setActiveDestination]);

  if (!isSupabaseConfigured) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-base text-gray-600">
          Supabase is not configured yet. Set EXPO_PUBLIC_SUPABASE_URL and
          EXPO_PUBLIC_SUPABASE_ANON_KEY (see .env.example) to load destination
          content.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ paddingTop: insets.top }} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 pt-2">
        <View className="flex-row items-center gap-2">
          {destination?.logo_url && (
            <Image source={{ uri: destination.logo_url }} className="h-8 w-8 rounded-full" />
          )}
          <Text className="text-xl font-bold text-gray-900">
            {destinationLoading ? 'Loading…' : destination?.name ?? 'Destination not found'}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/explore')}
        className="mx-4 mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
      >
        <Text className="text-gray-400">Search routes, places, activities…</Text>
      </Pressable>

      <View className="mt-6 px-4">
        <Text className="text-lg font-semibold text-gray-900">Recommended routes</Text>
      </View>

      {routesLoading ? (
        <ActivityIndicator className="mt-4" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 pl-4">
          {routes?.length ? (
            routes.map((route) => (
              <RouteCard
                key={route.id}
                id={route.id}
                name={route.name}
                distanceKm={route.distance_km}
                difficulty={route.difficulty}
                activityType={route.activity_type}
                onPress={() => router.push(`/route/${route.slug}`)}
              />
            ))
          ) : (
            <Text className="text-gray-400">No published routes yet.</Text>
          )}
        </ScrollView>
      )}

      <View className="mt-8 px-4 pb-8">
        <Text className="text-lg font-semibold text-gray-900">Services nearby</Text>
        <Text className="mt-2 text-gray-400">Coming in Phase 4.</Text>
      </View>
    </ScrollView>
  );
}
