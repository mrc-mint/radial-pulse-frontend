// Metro configuration (Expo defaults: monorepo watch folders, package exports).
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Production builds never contain the API mocks: `src/shell/mocking` (MSW and
// the mock data) is swapped for a stub that refuses to start. createConfig()
// already rejects API mocking in prod; this keeps the code out of the bundle.
if ((process.env.APP_ENV ?? 'local') === 'prod') {
  const services = path.join('src', 'shell', 'services.ts');
  const stub = path.resolve(__dirname, 'src/shell/mocking.prod.ts');
  const resolve = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === './mocking' && context.originModulePath.endsWith(services)) {
      return { type: 'sourceFile', filePath: stub };
    }
    return (resolve ?? context.resolveRequest)(context, moduleName, platform);
  };
}

module.exports = config;
