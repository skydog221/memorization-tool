
import React from 'react';
import { QAItem } from '../types';
import { toast } from 'react-toastify';

interface SummaryPageProps {
  mistakes: QAItem[];
  onReviewMistakesAsNewSession: (mistakes: QAItem[]) => void;
  onStartNewSession: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  mistakes,
  onReviewMistakesAsNewSession,
  onStartNewSession,
}) => {
  const handleExportMistakes = () => {
    if (mistakes.length === 0) {
      toast.info("No mistakes to export.");
      return;
    }
    const jsonString = JSON.stringify(mistakes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mistake_book.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Mistake book exported!");
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Session Summary</h2>
      {mistakes.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296A3.745 3.745 0 0 1 16.5 21a3.745 3.745 0 0 1-3.296-1.043A3.745 3.745 0 0 1 12 21a3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 7.5 21a3.745 3.745 0 0 1-3.296-1.043A3.745 3.745 0 0 1 3 18.296c-.963-.678-1.593-1.8-1.593-3.068a3.745 3.745 0 0 1 1.043-3.296A3.745 3.745 0 0 1 7.5 9c1.268 0 2.39.63 3.068 1.593A3.745 3.745 0 0 1 12 9c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 0 1 3.296 1.043A3.745 3.745 0 0 1 21 12Z" />
          </svg>
          <p className="text-xl text-gray-700">Congratulations! You have no mistakes in this session.</p>
        </div>
      ) : (
        <>
          <p className="text-lg text-gray-700 mb-4">
            You had {mistakes.length} mistake{mistakes.length > 1 ? 's' : ''} this session. Review them below or export them.
          </p>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-slate-50 mb-6 space-y-3">
            {mistakes.map((item, index) => (
              <div key={index} className="p-3 bg-white border border-red-200 rounded-md shadow-sm">
                <p className="font-semibold text-red-700">Q: {item.q}</p>
                <p className="text-sm text-gray-600">A: {item.a}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <button
              onClick={handleExportMistakes}
              className="w-full sm:w-auto flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Mistake Book
            </button>
            <button
              onClick={() => onReviewMistakesAsNewSession(mistakes)}
              className="w-full sm:w-auto flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-4.991-2.696V7.71a11.25 11.25 0 0 1-2.246-1.417l-3.182-3.182a11.25 11.25 0 0 0-15.909 0L2.985 7.71m16.023 2.696h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.664 0L2.985 16.95m4.992-4.993v4.992m0 0H2.985m4.992 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183" />
              </svg>
              Review These Mistakes Again
            </button>
          </div>
        </>
      )}
      <button
        onClick={onStartNewSession}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
        </svg>
        Start New Session (Go to Home)
      </button>
    </div>
  );
};

export default SummaryPage;
