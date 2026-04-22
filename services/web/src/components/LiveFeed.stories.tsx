import type { Meta, StoryObj } from '@storybook/react';
import { LiveFeed } from './LiveFeed';

const meta: Meta<typeof LiveFeed> = {
  title: 'Components/LiveFeed',
  component: LiveFeed,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'app-dark' },
    docs: {
      description: {
        component:
          'Real-time sidebar that surfaces WebSocket status-change events as they arrive. ' +
          'The WS connection indicator reflects the mocked connected state. ' +
          'The subscription is pending in Storybook (no live API), so the empty waiting state is shown.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LiveFeed>;

export const WaitingForEvents: Story = {
  name: 'Waiting for Events',
};
