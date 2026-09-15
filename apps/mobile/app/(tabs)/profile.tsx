import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-lg font-semibold text-gray-900">Profile</Text>
      <Text className="mt-2 text-center text-gray-500">
        Sign in with Apple, Google, or email — coming after MVP (see docs/architecture.md §6).
      </Text>
    </View>
  );
}
