const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  return config;
})();
