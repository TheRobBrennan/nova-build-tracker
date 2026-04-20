export type BuildStatus = 'PENDING' | 'IN_PROGRESS' | 'TESTING' | 'ACCEPTED' | 'REJECTED';
export type ComponentType =
  | 'HEAT_SHIELD'
  | 'ENGINE_COMPONENT'
  | 'AVIONICS'
  | 'STRUCTURAL'
  | 'PROPULSION';

export interface BuildStage {
  id: string;
  name: string;
  sequence: number;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TestEvent {
  id: string;
  eventType: string;
  result: string;
  performedAt: string;
  notes: string | null;
}

export interface Component {
  id: string;
  name: string;
  serialNumber: string;
  partNumber: string;
  type: ComponentType;
  status: BuildStatus;
  notes: string | null;
  buildStages: BuildStage[];
  testEvents: TestEvent[];
  createdAt: string;
  updatedAt: string;
}
