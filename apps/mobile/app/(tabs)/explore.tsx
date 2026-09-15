import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Search + filters (activity, distance, difficulty, duration, features —
 * see docs/architecture.md "Filters") land here in Phase 3. Placeholder for
 * now so the tab exists and routes correctly from Home's search bar.
 */
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-lg font-semibold text-gray-900">Explore</Text>
      <Text className="mt-2 text-center text-gray-500">
        Search and filters (activity, distance, difficulty, features) — coming in Phase 3.
      </Text>
    </View>
  );
}
