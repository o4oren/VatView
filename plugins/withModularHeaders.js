const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withModularHeaders(config) {
    return withDangerousMod(config, [
        'ios',
        (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
            let podfile = fs.readFileSync(podfilePath, 'utf8');
            if (!podfile.includes('use_modular_headers!')) {
                podfile = 'use_modular_headers!\n' + podfile;
            }
            fs.writeFileSync(podfilePath, podfile);
            return config;
        },
    ]);
};
