import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['PENDING', 'IN_PROGRESS', 'TESTING', 'ACCEPTED', 'REJECTED'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Pending: Story = {
  args: { status: 'PENDING' },
};

export const InProgress: Story = {
  name: 'In Progress',
  args: { status: 'IN_PROGRESS' },
};

export const Testing: Story = {
  args: { status: 'TESTING' },
};

export const Accepted: Story = {
  args: { status: 'ACCEPTED' },
};

export const Rejected: Story = {
  args: { status: 'REJECTED' },
};

export const AllStatuses: Story = {
  name: 'All Statuses',
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="PENDING" />
      <StatusBadge status="IN_PROGRESS" />
      <StatusBadge status="TESTING" />
      <StatusBadge status="ACCEPTED" />
      <StatusBadge status="REJECTED" />
    </div>
  ),
};
