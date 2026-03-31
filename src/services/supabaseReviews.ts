import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export type CreateReviewInput = Omit<Review, 'id' | 'created_at'>;

/**
 * Fetch all reviews for a specific project.
 */
export async function getProjectReviews(projectId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching reviews for project ${projectId}:`, error);
    throw error;
  }

  return data || [];
}

/**
 * Submit a new review for a project.
 */
export async function createProjectReview(review: CreateReviewInput): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  return data;
}

/**
 * Calculate the average rating for a project based on its reviews.
 */
export async function getProjectAverageRating(projectId: string): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('project_id', projectId);

  if (error) {
    console.error(`Error calculating average for project ${projectId}:`, error);
    throw error;
  }

  if (!data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0);
  const average = parseFloat((sum / data.length).toFixed(1));

  return { average, count: data.length };
}
