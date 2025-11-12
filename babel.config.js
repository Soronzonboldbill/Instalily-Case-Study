module.exports = function (api) {
  api.cache(true); // Cache the Babel configuration for faster builds

  return {
    presets: ["babel-preset-expo"], // Use the Expo Babel preset
    plugins: [
      ["module:react-native-dotenv"],
      // Add any additional Babel plugins here if needed
      // For example, for React Native Paper, you might add:
      // 'react-native-paper/babel',
      // For module aliasing, you might add:
      // [
      //   'module-resolver',
      //   {
      //     alias: {
      //       '~': './src', // Example alias for 'src' directory
      //     },
      //   },
      // ],
    ],
    env: {
      production: {
        // Add production-specific plugins or configurations here
        // For example, to optimize bundle size for React Native Paper:
        // plugins: ['react-native-paper/babel'],
      },
    },
  };
};
