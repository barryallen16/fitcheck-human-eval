'use client';

import { useState, useEffect } from 'react';
import { saveEvaluation } from './actions';
import EVAL_DATA from '../data/eval_data_frontend.json'; 

export default function HumanEvaluation() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relevance, setRelevance] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Prevents hydration errors

  // 1. On page load, get saved progress and pick a random unrated image
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem('fitcheck_progress') || '[]');
    setCompletedIds(savedProgress);
    pickNextItem(savedProgress);
    setIsLoaded(true);
  }, []);

  // 2. Logic to pick a random image the user hasn't seen yet
  const pickNextItem = (completed: string[]) => {
    const remaining = EVAL_DATA.filter(item => !completed.includes(item.eval_id));
    
    if (remaining.length === 0) {
      setCurrentItem(null); // All done!
    } else {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      setCurrentItem(remaining[randomIndex]);
    }
  };

  const handleSubmit = async (overall: number) => {
    if (!relevance || !currentItem) return alert("Please rate Relevance first!");
    setIsSubmitting(true);

    // Save to Neon Database
    const result = await saveEvaluation(
      currentItem.eval_id,
      currentItem.model_type,
      relevance,
      overall
    );

    if (result.success) {
      // 3. Save progress locally so a page refresh doesn't show this image again
      const newCompleted = [...completedIds, currentItem.eval_id];
      setCompletedIds(newCompleted);
      localStorage.setItem('fitcheck_progress', JSON.stringify(newCompleted));
      
      setRelevance(null);
      pickNextItem(newCompleted); // Load next random image
    } else {
      alert("Failed to save score. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  // Wait for client-side storage to load
  if (!isLoaded) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  // If they have rated everything in the dataset
  if (!currentItem) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">🎉 Evaluation Complete!</h1>
        <p className="text-gray-600">You have rated {completedIds.length} images. Thank you so much!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-sm text-gray-500 font-medium text-center bg-white py-2 rounded-full shadow-sm w-48 mx-auto border border-gray-200">
          Rated: <span className="text-blue-600 font-bold">{completedIds.length}</span> / {EVAL_DATA.length}
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
                <p><strong>Color Logic:</strong> {currentItem.color_logic}</p>
                <p><strong>Silhouette Logic:</strong> {currentItem.silhouette_logic}</p>
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