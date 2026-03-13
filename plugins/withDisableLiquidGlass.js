const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withDisableLiquidGlass(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.UIDesignRequiresCompatibility = true;
    return config;
  });
};
