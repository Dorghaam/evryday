module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [ // Tamagui plugin configuration
        "@tamagui/babel-plugin",
        {
          components: ["tamagui"],
          config: "./tamagui.config.ts", // Path to your Tamagui config
          logTimings: true,
        },
      ],
      [ // Recommended for Reanimated (often used with Tamagui or Gesture Handler)
        "react-native-reanimated/plugin",
        {
          globals: ['__scanCodes'], // Optional, for vision-camera-code-scanner if you ever use it
        }
      ],
    ],
  };
}; 