import { NextRequest, NextResponse } from 'next/server';
import { 
  getProjectReviews, 
  createProjectReview,
  getProjectAverageRating 
} from '@/services/supabaseReviews';

/**
 * Handle GET requests for project reviews.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await getProjectReviews(params.id);
    const { average, count } = await getProjectAverageRating(params.id);

    return NextResponse.json({ 
      success: true, 
      data: { 
        reviews,
        stats: { average, count } 
      } 
    });
  } catch (error) {
    console.error(`API Error fetching reviews for project ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests for project reviews.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, userName, rating, comment } = body;

    if (!userId || !userName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newReview = await createProjectReview({
      project_id: params.id,
      user_id: userId,
      user_name: userName,
      rating,
      comment
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error) {
    console.error(`API Error creating review for project ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
