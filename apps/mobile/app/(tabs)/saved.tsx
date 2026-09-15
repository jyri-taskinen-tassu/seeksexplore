import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Requires auth (favourites/saved/completed routes — see docs/architecture.md
 * §6). MVP ships without login, so this is a placeholder, not a broken
 * feature: the app works fully without it.
 */
export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-lg font-semibold text-gray-900">Saved</Text>
      <Text className="mt-2 text-center text-gray-500">
        Sign in to save routes and track completed ones — coming after MVP.
      </Text>
    </View>
  );
}
