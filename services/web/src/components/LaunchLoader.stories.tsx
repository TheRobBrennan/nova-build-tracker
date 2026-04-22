import type { Meta, StoryObj } from '@storybook/react';
import { LaunchLoader } from './LaunchLoader';

const meta: Meta<typeof LaunchLoader> = {
  title: 'Components/LaunchLoader',
  component: LaunchLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'app-dark' },
    docs: {
      description: {
        component:
          'Full-screen overlay displayed while the WebSocket telemetry link is being established. ' +
          'In Storybook the WS state module is mocked, so the connecting animation is always visible.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LaunchLoader>;

export const Connecting: Story = {};
