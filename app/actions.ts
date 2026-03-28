'use server';

import { neon } from '@neondatabase/serverless';

export async function saveEvaluation(
  eval_id: string, 
  model_type: string, 
  relevance_score: number, 
  overall_score: number
) {
  try {
    // Gracefully handle whichever variable Vercel injects
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("Missing Database Connection String");
    }

    const sql = neon(connectionString);
    
    // ⚠️ CRITICAL FIX: No parentheses () around the query. 
    // The backticks MUST touch the word `sql` directly.
    await sql`
      INSERT INTO human_evaluations (eval_id, model_type, relevance_score, overall_score) 
      VALUES (${eval_id}, ${model_type}, ${relevance_score}, ${overall_score})
    `;

    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: 'Failed to save data' };
  }
}