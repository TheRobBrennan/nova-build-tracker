import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const db = new PrismaClient({ adapter });

async function main() {
  const count = await db.component.count();
  if (count > 0) {
    console.log(`  Database already has ${count} components — skipping seed`);
    return;
  }

  console.log('  Inserting sample Nova components...');

  await db.component.create({
    data: {
      name: 'TPS Panel — Windward Segment 1',
      serialNumber: 'TPS-W-001',
      partNumber: 'NV-TPS-001',
      type: 'HEAT_SHIELD',
      status: 'TESTING',
      notes: 'Primary windward thermal protection panel for Nova vehicle',
      buildStages: {
        create: [
          { name: 'Raw Material Inspection', sequence: 1, completedAt: new Date('2026-04-01') },
          { name: 'Panel Fabrication', sequence: 2, completedAt: new Date('2026-04-08') },
          { name: 'Thermal Coating Application', sequence: 3, completedAt: new Date('2026-04-15') },
          { name: 'Thermal Cycling Test', sequence: 4 },
        ],
      },
      testEvents: {
        create: [
          { eventType: 'DIMENSIONAL_INSPECTION', result: 'PASS', notes: 'Within spec ±0.005"' },
          { eventType: 'THERMAL_SHOCK', result: 'PASS', notes: 'No delamination observed' },
        ],
      },
    },
  });

  await db.component.create({
    data: {
      name: 'Main Engine Nozzle Assembly',
      serialNumber: 'ME-NOZZLE-042',
      partNumber: 'NV-ME-042',
      type: 'ENGINE_COMPONENT',
      status: 'IN_PROGRESS',
      notes: 'Regeneratively cooled main engine nozzle',
      buildStages: {
        create: [
          { name: 'Machining', sequence: 1, completedAt: new Date('2026-04-10') },
          { name: 'Welding & Assembly', sequence: 2 },
          { name: 'Pressure Test', sequence: 3 },
          { name: 'Final Inspection', sequence: 4 },
        ],
      },
    },
  });

  await db.component.create({
    data: {
      name: 'Flight Computer Board Rev 3',
      serialNumber: 'FC-007-R3',
      partNumber: 'NV-FC-007',
      type: 'AVIONICS',
      status: 'ACCEPTED',
      notes: 'Primary flight computer for GNC — guidance, navigation, and control',
      buildStages: {
        create: [
          { name: 'PCB Fabrication', sequence: 1, completedAt: new Date('2026-03-20') },
          { name: 'Component Population', sequence: 2, completedAt: new Date('2026-03-25') },
          { name: 'Functional Test', sequence: 3, completedAt: new Date('2026-04-01') },
          { name: 'Environmental Test', sequence: 4, completedAt: new Date('2026-04-10') },
        ],
      },
      testEvents: {
        create: [
          { eventType: 'FUNCTIONAL_TEST', result: 'PASS', notes: 'All I/O nominal' },
          { eventType: 'VIBRATION_TEST', result: 'PASS', notes: '20g sweep — no anomalies' },
          { eventType: 'THERMAL_VAC', result: 'PASS', notes: '-40°C to +85°C — nominal' },
        ],
      },
    },
  });

  await db.component.create({
    data: {
      name: 'Fuel Tank Ring Frame — Segment 19',
      serialNumber: 'TR-019',
      partNumber: 'NV-TR-019',
      type: 'STRUCTURAL',
      status: 'PENDING',
      notes: 'Structural ring frame connecting fuel tank to vehicle body',
      buildStages: {
        create: [
          { name: 'Raw Material Inspection', sequence: 1 },
          { name: 'CNC Machining', sequence: 2 },
          { name: 'NDT Inspection', sequence: 3 },
          { name: 'Surface Treatment', sequence: 4 },
          { name: 'Final Dimensional Check', sequence: 5 },
        ],
      },
    },
  });

  await db.component.create({
    data: {
      name: 'LOX Feed Line Assembly',
      serialNumber: 'PROP-LOX-007',
      partNumber: 'NV-PROP-007',
      type: 'PROPULSION',
      status: 'IN_PROGRESS',
      notes: 'Liquid oxygen feed line from tank to engine manifold',
      buildStages: {
        create: [
          { name: 'Tube Fabrication', sequence: 1, completedAt: new Date('2026-04-12') },
          { name: 'Fitting Weld', sequence: 2, completedAt: new Date('2026-04-17') },
          { name: 'Leak Test', sequence: 3 },
          { name: 'Cleanliness Verification', sequence: 4 },
        ],
      },
    },
  });

  console.log('  Seed complete — 5 Nova components inserted');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
