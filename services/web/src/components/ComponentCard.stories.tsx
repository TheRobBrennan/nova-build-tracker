import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentCard } from './ComponentCard';
import type { Component } from '../types';

const buildStages = [
  { id: 'stage-1', name: 'Raw Material Inspection', sequence: 1, completedAt: '2024-01-15T10:00:00Z', notes: null, createdAt: '2024-01-14T08:00:00Z' },
  { id: 'stage-2', name: 'Machining', sequence: 2, completedAt: '2024-01-20T14:30:00Z', notes: 'Passed dimensional check', createdAt: '2024-01-14T08:00:00Z' },
  { id: 'stage-3', name: 'NDT Inspection', sequence: 3, completedAt: null, notes: null, createdAt: '2024-01-14T08:00:00Z' },
  { id: 'stage-4', name: 'Surface Treatment', sequence: 4, completedAt: null, notes: null, createdAt: '2024-01-14T08:00:00Z' },
];

const testEvents = [
  { id: 'test-1', eventType: 'DIMENSIONAL_INSPECTION', result: 'PASS', performedAt: '2024-01-20T15:00:00Z', notes: null },
  { id: 'test-2', eventType: 'VIBRATION_TEST', result: 'PASS', performedAt: '2024-01-21T09:00:00Z', notes: null },
];

const base: Component = {
  id: '1',
  name: 'TPS Panel — Windward Segment 1',
  serialNumber: 'TPS-W-001',
  partNumber: 'NV-TPS-001',
  type: 'HEAT_SHIELD',
  status: 'PENDING',
  notes: null,
  buildStages: [],
  testEvents: [],
  createdAt: '2024-01-14T08:00:00Z',
  updatedAt: '2024-01-22T10:00:00Z',
};

const meta: Meta<typeof ComponentCard> = {
  title: 'Components/ComponentCard',
  component: ComponentCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ComponentCard>;

export const Pending: Story = {
  args: {
    component: { ...base, status: 'PENDING', buildStages, testEvents: [] },
  },
};

export const InProgress: Story = {
  name: 'In Progress',
  args: {
    component: {
      ...base,
      name: 'Main Engine Nozzle Assembly',
      serialNumber: 'ENG-N-001',
      partNumber: 'NV-ENG-001',
      type: 'ENGINE_COMPONENT',
      status: 'IN_PROGRESS',
      buildStages,
      testEvents: [],
    },
  },
};

export const Testing: Story = {
  args: {
    component: {
      ...base,
      name: 'Flight Computer Board Rev 3',
      serialNumber: 'AVI-FC-003',
      partNumber: 'NV-AVI-003',
      type: 'AVIONICS',
      status: 'TESTING',
      buildStages,
      testEvents,
    },
  },
};

export const Accepted: Story = {
  args: {
    component: {
      ...base,
      name: 'LOX Feed Line Assembly',
      serialNumber: 'PROP-LOX-001',
      partNumber: 'NV-PROP-001',
      type: 'PROPULSION',
      status: 'ACCEPTED',
      buildStages: buildStages.map((s) => ({ ...s, completedAt: '2024-01-22T08:00:00Z' })),
      testEvents,
    },
  },
};

export const Rejected: Story = {
  args: {
    component: {
      ...base,
      name: 'Fuel Tank Ring Frame — Segment 19',
      serialNumber: 'STR-TF-019',
      partNumber: 'NV-STR-019',
      type: 'STRUCTURAL',
      status: 'REJECTED',
      buildStages,
      testEvents: [
        { id: 'test-1', eventType: 'DIMENSIONAL_INSPECTION', result: 'FAIL', performedAt: '2024-01-23T11:00:00Z', notes: 'Out of tolerance on Z-axis' },
      ],
    },
  },
};

export const NoStages: Story = {
  name: 'No Build Stages',
  args: {
    component: { ...base, status: 'PENDING', buildStages: [], testEvents: [] },
  },
};

export const AllStagesComplete: Story = {
  name: 'All Stages Complete',
  args: {
    component: {
      ...base,
      status: 'TESTING',
      buildStages: buildStages.map((s) => ({ ...s, completedAt: '2024-01-22T08:00:00Z' })),
      testEvents,
    },
  },
};
