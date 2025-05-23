const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  // Your NativeWind configuration options
  input: './app/global.css', // Path to your global CSS file
  inlineRem: 14, // Set rem value (14 is default for NativeWind v4)
}); 