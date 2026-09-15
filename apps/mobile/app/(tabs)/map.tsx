import { View, Text } from 'react-native';
import { MapView, MapCamera, UserLocationMarker, RouteLine, PoiMarker } from '../../src/lib/maps/MapProvider';
import { useLocationTracking } from '../../src/lib/useLocationTracking';
import { useDestinationStore } from '../../src/state/useDestinationStore';
import { useRoutes } from '../../src/api/routes';
import { usePois } from '../../src/api/pois';
import { isSupabaseConfigured } from '../../src/lib/supabase';

const POI_COLORS: Record<string, string> = {
  campfire: '#D9A441',
  viewpoint: '#1B4332',
};

export default function MapScreen() {
  const destination = useDestinationStore((s) => s.activeDestination);
  const { permission } = useLocationTracking(true);
  const { data: routes } = useRoutes(destination?.id);
  const { data: pois } = usePois(destination?.id);

  return (
    <View className="flex-1">
      {!isSupabaseConfigured && (
        <View className="absolute top-0 left-0 right-0 z-10 bg-amber-50 px-4 py-2">
          <Text className="text-center text-xs text-amber-800">
            Demo data — Supabase isn't linked yet (see .env.example)
          </Text>
        </View>
      )}
      <MapView>
        <MapCamera
          center={
            destination?.center_lat && destination?.center_lng
              ? { lat: destination.center_lat, lng: destination.center_lng }
              : undefined
          }
          zoomLevel={destination?.default_zoom ?? 13}
          followUser={permission === 'granted'}
        />
        {permission === 'granted' && <UserLocationMarker />}
        {routes?.map((route) => (
          <RouteLine key={route.id} id={route.id} geometry={route.geometry} />
        ))}
        {pois?.map((poi) => (
          <PoiMarker key={poi.id} id={poi.id} location={poi.location}>
            <View
              className="h-3 w-3 rounded-full border-2 border-white"
              style={{ backgroundColor: POI_COLORS[poi.category] ?? '#1B4332' }}
            />
          </PoiMarker>
        ))}
      </MapView>
      {permission === 'denied' && (
        <View className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/80 p-3">
          <Text className="text-center text-white">
            Location permission denied — enable it in Settings to see your position on the map.
          </Text>
        </View>
      )}
    </View>
  );
}
