const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Custom resolver to handle problematic modules
const defaultResolver = config.resolver.resolverMainFields;
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add Node.js polyfills for React Native
config.resolver.alias = {
  ...config.resolver.alias,
  stream: 'stream-browserify',
  crypto: 'react-native-crypto',
  buffer: '@craftzdog/react-native-buffer',
  vm: 'vm-browserify',
  _stream_duplex: 'readable-stream/duplex',
  _stream_passthrough: 'readable-stream/passthrough',
  _stream_readable: 'readable-stream/readable',
  _stream_transform: 'readable-stream/transform',
  _stream_writable: 'readable-stream/writable',
};

// Configure platforms
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Custom module resolution to handle ws package
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle ws module - return empty module for native platforms
  if (moduleName === 'ws' && (platform === 'ios' || platform === 'android')) {
    return {
      filePath: path.resolve(__dirname, 'node_modules/react-native/Libraries/WebSocket/WebSocket.js'),
      type: 'sourceFile',
    };
  }
  
  // Handle stream imports from ws package
  if (moduleName === 'stream' && context.originModulePath && context.originModulePath.includes('node_modules/ws')) {
    return {
      filePath: require.resolve('stream-browserify'),
      type: 'sourceFile',
    };
  }

  // Default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Transform specific Node.js modules for React Native compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = withNativeWind(config, {
  input: './app/global.css',
  inlineRem: 14,
});