import { NextResponse } from 'next/server';

interface Incident {
  id: number;
  status: 'active' | 'resolved';
  startedAt: string;
  endedAt?: string;
  clientId?: string;
  location?: { lat: number; lng: number };
  notes?: string;
}

// In-memory store for incidents
let incidents: Incident[] = [];
let nextId = 1;

// GET - List all incidents
export async function GET() {
  try {
    // seed a demo incident if empty so UI has data
    if (incidents.length === 0) {
      incidents.push({
        id: nextId++,
        status: 'resolved',
        startedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        endedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        clientId: 'demo-client',
        location: { lat: 17.4419, lng: 78.3937 },
        notes: 'Seeded demo incident for initial display',
      });
    }

    return NextResponse.json({ incidents }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Start a new incident
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientId, location, notes } = body;

    const incident: Incident = {
      id: nextId++,
      status: 'active',
      startedAt: new Date().toISOString(),
      clientId,
      location,
      notes,
    };

    incidents.push(incident);

    return NextResponse.json(
      { incident },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Resolve an incident
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    const incidentIndex = incidents.findIndex(incident => incident.id === id);

    if (incidentIndex === -1) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    const incident = incidents[incidentIndex];

    if (incident.status === 'resolved') {
      return NextResponse.json(
        { error: 'Incident already resolved' },
        { status: 404 }
      );
    }

    incident.status = 'resolved';
    incident.endedAt = new Date().toISOString();

    return NextResponse.json(
      { incident },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error resolving incident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}