import { NextResponse } from 'next/server';
import {
  getBehaviouralDriftRadarReport,
  computeEmployeeBehaviourFeatures,
  predictPrioritisation,
  DEFAULT_TRAINED_MODEL_ARTIFACT,
} from '@/lib/behavioural-drift-radar';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (employeeId) {
      const features = await computeEmployeeBehaviourFeatures(employeeId);
      const prediction = predictPrioritisation(features);

      return NextResponse.json({
        features,
        prediction,
        modelMetadata: DEFAULT_TRAINED_MODEL_ARTIFACT,
      });
    }

    const report = await getBehaviouralDriftRadarReport();
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error running behavioural drift radar:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate behavioural drift report' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, overrideFeatures } = body;

    if (!employeeId && !overrideFeatures) {
      return NextResponse.json(
        { error: 'employeeId or overrideFeatures is required' },
        { status: 400 }
      );
    }

    let features;
    if (overrideFeatures) {
      features = overrideFeatures;
    } else {
      features = await computeEmployeeBehaviourFeatures(employeeId);
    }

    const prediction = predictPrioritisation(features);

    return NextResponse.json({
      features,
      prediction,
      modelMetadata: DEFAULT_TRAINED_MODEL_ARTIFACT,
    });
  } catch (error: any) {
    console.error('Error predicting behavioural drift:', error);
    return NextResponse.json(
      { error: error?.message || 'Simulation error in behavioural drift engine' },
      { status: 500 }
    );
  }
}
