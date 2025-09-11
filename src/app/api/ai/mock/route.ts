import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface MockAIRequest {
  audioLevel?: number;
  motionScore?: number;
  faceFearScore?: number;
  safeWordDetected?: boolean;
}

interface MockAIResponse {
  triggered: boolean;
  risk: number;
  reason: string[];
}

const WEIGHTS = {
  audio: 0.25,
  motion: 0.35,
  face: 0.35,
  safeWord: 0.5
};

const THRESHOLDS = {
  audio: 0.8,
  motion: 0.75,
  face: 0.7,
  safeWord: true // boolean check
};

export async function POST(request: NextRequest) {
  try {
    const body: MockAIRequest = await request.json();
    const { audioLevel = 0, motionScore = 0, faceFearScore = 0, safeWordDetected = false } = body;

    // Calculate weighted risk score
    let risk = (audioLevel * WEIGHTS.audio) + (motionScore * WEIGHTS.motion) + (faceFearScore * WEIGHTS.face);
    
    // Add safe word bonus if detected
    if (safeWordDetected) {
      risk += WEIGHTS.safeWord;
    }
    
    // Normalize to 0..1 range by clamping
    risk = Math.max(0, Math.min(1, risk));

    // Determine if any signals exceeded thresholds
    const triggered: string[] = [];
    
    if (audioLevel > THRESHOLDS.audio) {
      triggered.push('High audio distress detected');
    }
    if (motionScore > THRESHOLDS.motion) {
      triggered.push('Abnormal motion patterns detected');
    }
    if (faceFearScore > THRESHOLDS.face) {
      triggered.push('Facial fear expression detected');
    }
    if (safeWordDetected) {
      triggered.push('Safe word activation detected');
    }

    const response: MockAIResponse = {
      triggered: triggered.length > 0,
      risk,
      reason: triggered
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process distress detection' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}

export async function GET() {
  const example: MockAIRequest = {
    audioLevel: 0.85,
    motionScore: 0.6,
    faceFearScore: 0.8,
    safeWordDetected: false
  };

  const exampleResponse: MockAIResponse = {
    triggered: true,
    risk: 0.93,
    reason: ['High audio distress detected', 'Facial fear expression detected']
  };

  return NextResponse.json({
    requestSchema: {
      type: 'object',
      properties: {
        audioLevel: { type: 'number', minimum: 0, maximum: 1, description: 'Audio distress level' },
        motionScore: { type: 'number', minimum: 0, maximum: 1, description: 'Motion abnormality score' },
        faceFearScore: { type: 'number', minimum: 0, maximum: 1, description: 'Facial fear detection score' },
        safeWordDetected: { type: 'boolean', description: 'Safe word triggered' }
      }
    },
    responseSchema: {
      type: 'object',
      properties: {
        triggered: { type: 'boolean', description: 'Whether distress threshold was exceeded' },
        risk: { type: 'number', minimum: 0, maximum: 1, description: 'Normalized risk score' },
        reason: { type: 'array', items: { type: 'string' }, description: 'List of triggered alerts' }
      }
    },
    exampleRequest: example,
    exampleResponse: exampleResponse
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}