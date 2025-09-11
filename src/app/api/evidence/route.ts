import { NextResponse } from 'next/server';

type EvidenceType = 'audio' | 'video';

interface Evidence {
  id: number;
  type: EvidenceType;
  storedUrl: string;
  durationSec?: number;
  incidentId?: number;
  createdAt: string;
}

interface EvidencePayload {
  type: EvidenceType;
  url?: string;
  base64?: string;
  durationSec?: number;
  incidentId?: number;
}

let evidenceStore: Evidence[] = [];

export async function POST(request: Request) {
  try {
    const body: EvidencePayload = await request.json();

    // Validate required fields
    if (!body.type || (body.type !== 'audio' && body.type !== 'video')) {
      return NextResponse.json(
        { error: 'Invalid or missing type. Must be "audio" or "video"' },
        { status: 400 }
      );
    }

    // Validate that at least one of url or base64 is provided
    if (!body.url && !body.base64) {
      return NextResponse.json(
        { error: 'Either url or base64 must be provided' },
        { status: 400 }
      );
    }

    let storedUrl: string;
    if (body.base64) {
      const mimeType = body.type === 'audio' ? 'audio/aac' : 'video/mp4';
      storedUrl = `data:${mimeType};base64,${body.base64}`;
    } else if (body.url) {
      storedUrl = body.url;
    } else {
      // This should never happen due to validation above
      storedUrl = '';
    }

    const evidence: Evidence = {
      id: Date.now(), // Simple ID generation using timestamp
      type: body.type,
      storedUrl,
      durationSec: body.durationSec,
      incidentId: body.incidentId,
      createdAt: new Date().toISOString(),
    };

    evidenceStore.push(evidence);

    return NextResponse.json(
      { evidence },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error processing evidence upload:', error);
    return NextResponse.json(
      { error: 'Failed to process evidence upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    return NextResponse.json(
      { evidence: evidenceStore },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving evidence:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve evidence' },
      { status: 500 }
    );
  }
}