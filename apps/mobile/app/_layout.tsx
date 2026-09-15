import '../src/global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/api/queryClient';
import { useActiveDestination } from '../src/api/destination';
import { useDestinationStore } from '../src/state/useDestinationStore';

/**
 * Loads the active destination once, at the root, so it's in
 * useDestinationStore before any screen mounts — including a deep link
 * straight into /route/[slug], which otherwise has no destination_id to
 * query with (see docs/architecture.md §3).
 */
function DestinationLoader() {
  const { data: destination } = useActiveDestination();
  const setActiveDestination = useDestinationStore((s) => s.setActiveDestination);

  useEffect(() => {
    if (destination) setActiveDestination(destination);
  }, [destination, setActiveDestination]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <DestinationLoader />
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="route/[slug]" options={{ headerShown: true, title: '' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
