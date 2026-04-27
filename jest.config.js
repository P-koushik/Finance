module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|@react-native-async-storage|react-native-screens|react-native-safe-area-context|react-native-svg|lucide-react-native|react-native-calendars|react-native-swipe-gestures)/)',
  ],
};
