'use server';

import { neon } from '@neondatabase/serverless';

export async function saveEvaluation(
  eval_id: string, 
  model_type: string, 
  relevance_score: number, 
  overall_score: number
) {
  try {
    // Connect to the Neon database using DATABASE_URL
    const sql = neon(`${process.env.DATABASE_URL}`);
    
    // Insert the data using the standard parameter array method from the Neon docs
    await sql(
      `INSERT INTO human_evaluations (eval_id, model_type, relevance_score, overall_score) VALUES ($1, $2, $3, $4)`, 
      [eval_id, model_type, relevance_score, overall_score]
    );

    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Failed to save data' };
  }
}