import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CreateComponentForm } from './CreateComponentForm';

const meta: Meta<typeof CreateComponentForm> = {
  title: 'Components/CreateComponentForm',
  component: CreateComponentForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'app-dark' },
    docs: {
      description: {
        component:
          'Modal overlay form for creating a new Nova component. ' +
          'The onClose prop is wired to the cancel button and the backdrop. ' +
          'In Storybook the Apollo mutation is mocked via MockedProvider with no responses configured.',
      },
    },
  },
  argTypes: {
    onClose: { action: 'onClose' },
  },
};

export default meta;
type Story = StoryObj<typeof CreateComponentForm>;

export const Default: Story = {
  args: {
    onClose: () => {},
  },
};
