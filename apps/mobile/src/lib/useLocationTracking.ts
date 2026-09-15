import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useUserLocationStore } from '../state/useUserLocationStore';

export type LocationPermissionState = 'undetermined' | 'granted' | 'denied';

/**
 * Requests foreground location permission and streams updates into
 * useUserLocationStore while the calling screen is mounted. Screens read
 * from the store, not from this hook's return value, so multiple screens
 * can share one location stream without requesting permission twice.
 */
export function useLocationTracking(enabled: boolean) {
  const [permission, setPermission] = useState<LocationPermissionState>('undetermined');
  const setLocation = useUserLocationStore((s) => s.setLocation);

  useEffect(() => {
    if (!enabled) return;

    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      setPermission(status === 'granted' ? 'granted' : 'denied');
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading,
            accuracy: position.coords.accuracy,
          });
        },
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled, setLocation]);

  return { permission };
}
