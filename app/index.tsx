import { Text, View } from 'tamagui';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-paper-light dark:bg-paper-dark p-4">
      <Text className="text-2xl font-bold color-ink-primary dark:color-ink-primary_dark mb-4">
        Welcome to Evryday!
      </Text>
      <Text className="text-base color-ink-secondary dark:color-ink-secondary_dark text-center">
        Your daily dose of ideas starts here.
      </Text>
      <Text className="text-base color-brand-orange mt-2">
        Tailwind styling is active!
      </Text>

      <View mt="$4" p="$2" backgroundColor="$blue5Light" borderRadius="$3">
        <Text color="$blue10Dark">This is a Tamagui-specific styled View.</Text>
      </View>
    </View>
  );
}
