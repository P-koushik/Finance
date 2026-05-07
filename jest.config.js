module.exports = {
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
  },
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|@react-native-async-storage|nativewind|react-native-css-interop|react-native-screens|react-native-safe-area-context|react-native-svg|lucide-react-native|react-native-calendars|react-native-swipe-gestures)/)',
  ],
};
