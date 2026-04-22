import React from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import '../src/index.css';

const withApolloMock: Decorator = (Story) => (
  <MockedProvider mocks={[]} addTypename={false}>
    <Story />
  </MockedProvider>
);

const preview: Preview = {
  decorators: [withApolloMock],
  parameters: {
    backgrounds: {
      default: 'app-dark',
      values: [
        { name: 'app-dark', value: '#0a0f1e' },
        { name: 'slate-900', value: '#0f172a' },
        { name: 'white', value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;
