import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    const mockPath = resolve(__dirname, './__mocks__/apolloClient.ts');
    config.plugins = [
      ...(Array.isArray(config.plugins) ? config.plugins : []),
      {
        name: 'storybook-mock-apollo-client',
        resolveId(id: string) {
          if (id.endsWith('/apollo/client')) {
            return mockPath;
          }
          return undefined;
        },
      },
    ];
    return config;
  },
};

export default config;
