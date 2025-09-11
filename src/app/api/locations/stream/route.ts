import { NextResponse } from 'next/server';

export type LocationPing = {
  userId?: string;
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
};

const lastLocationByClient = new Map<string, LocationPing>();

export async function POST(request: Request) {
  try {
    const clientId = request.headers.get('x-client-id') || 'anon';
    const body = await request.json();

    if (
      typeof body.lat !== 'number' ||
      typeof body.lng !== 'number' ||
      typeof body.timestamp !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid body: lat, lng, and timestamp must be numbers.' },
        { status: 400 }
      );
    }

    const location: LocationPing = {
      userId: body.userId,
      lat: body.lat,
      lng: body.lng,
      accuracy: body.accuracy,
      timestamp: body.timestamp,
    };

    lastLocationByClient.set(clientId, location);

    return NextResponse.json(
      {
        ok: true,
        receivedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function GET() {
  try {
    const clients = Array.from(lastLocationByClient.entries()).map(
      ([clientId, location]) => ({
        clientId,
        location,
      })
    );

    return NextResponse.json(
      { clients },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}