'use client';

import { useState } from 'react';
import { saveEvaluation } from './actions';
import EVAL_DATA from '../data/eval_data_frontend.json'; 

export default function HumanEvaluation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relevance, setRelevance] = useState<number | null>(null);

  if (currentIndex >= EVAL_DATA.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Evaluation Complete! Thank you. 🎉</h1>
      </div>
    );
  }

  const currentItem = EVAL_DATA[currentIndex];

  const handleSubmit = async (overall: number) => {
    if (!relevance) return alert("Please rate Relevance first!");
    setIsSubmitting(true);

    // Call the Neon Server Action
    const result = await saveEvaluation(
      currentItem.eval_id,
      currentItem.model_type,
      relevance,
      overall
    );

    if (result.success) {
      setRelevance(null);
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert("Failed to save score. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-sm text-gray-500 font-medium text-center">
          Image {currentIndex + 1} of {EVAL_DATA.length}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-center">
             <img 
               src={currentItem.image_url} 
               alt="Garment" 
               className="h-72 object-contain bg-gray-50 rounded-lg"
             />
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detected Garment</h3>
              <p className="text-gray-800 mt-1">{currentItem.summary}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider">AI Stylist Recommendation</h3>
              <p className="text-blue-900 font-medium mt-1">{currentItem.recommended_garment}</p>
              <div className="mt-3 text-sm text-blue-800 space-y-2">
                <p><strong>Color:</strong> {currentItem.color_logic}</p>
                <p><strong>Silhouette:</strong> {currentItem.silhouette_logic}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h3 className="text-md font-bold text-gray-900 mb-2">1. Relevance & Culture</h3>
            <p className="text-sm text-gray-500 mb-3">Is the recommended pairing culturally appropriate and sensible?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={`rel-${score}`}
                  onClick={() => setRelevance(score)}
                  className={`flex-1 py-3 rounded-md border font-bold transition-colors ${
                    relevance === score ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-bold text-gray-900 mb-2">2. Overall Quality</h3>
            <p className="text-sm text-gray-500 mb-3">Overall, would this recommendation help someone dress well? (Clicking saves and moves to next)</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={`ovr-${score}`}
                  disabled={!relevance || isSubmitting}
                  onClick={() => handleSubmit(score)}
                  className="flex-1 py-3 rounded-md border bg-gray-800 text-white hover:bg-gray-700 font-bold disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}