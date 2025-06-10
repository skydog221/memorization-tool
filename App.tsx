import React, { useState, useEffect, useCallback } from "react";
import { QAItem, View } from "./types";
import { StorageService } from "./services/storageService";
import HomePage from "./components/HomePage";
import RecitationPage from "./components/RecitationPage";
import SummaryPage from "./components/SummaryPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);
  const [allQuestions, setAllQuestions] = useState<QAItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentMistakes, setCurrentMistakes] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadedSession = StorageService.loadSession();
    const loadedMistakes = StorageService.loadMistakes();

    if (loadedSession && loadedSession.items.length > 0) {
      setAllQuestions(loadedSession.items);
      setCurrentQuestionIndex(loadedSession.currentIndex || 0);
      // Optional: Offer to resume session or start new. For now, loads it.
      // If you want to explicitly ask to resume, set currentView to a specific "resume" view or show a modal.
    }
    if (loadedMistakes) {
      setCurrentMistakes(loadedMistakes);
    }
    setIsLoading(false);
  }, []);

  const handleStartNewSession = useCallback((questions: QAItem[]) => {
    setAllQuestions(questions);
    setCurrentQuestionIndex(0);
    setCurrentMistakes([]); // Clear mistakes for a new session
    StorageService.saveSession({ items: questions, currentIndex: 0 });
    StorageService.saveMistakes([]); // Also clear persisted mistakes
    setCurrentView(View.Recitation);
    toast.success("New session started!");
  }, []);

  const handleReviewMistakes = useCallback((mistakeQuestions: QAItem[]) => {
    setAllQuestions(mistakeQuestions);
    setCurrentQuestionIndex(0);
    setCurrentMistakes([]); // Clear current mistakes list as we are reviewing them now
    StorageService.saveSession({ items: mistakeQuestions, currentIndex: 0 });
    // Don't clear the main mistake book from storage unless explicitly asked
    setCurrentView(View.Recitation);
    toast.info("Reviewing mistakes as a new session.");
  }, []);

  const handleAddToMistakes = useCallback((item: QAItem) => {
    setCurrentMistakes((prevMistakes) => {
      // Avoid duplicates
      if (!prevMistakes.some((m) => m.q === item.q)) {
        const updatedMistakes = [...prevMistakes, item];
        StorageService.saveMistakes(updatedMistakes);
        toast.warn(`"${item.q.substring(0, 20)}..." added to mistakes.`);
        return updatedMistakes;
      }
      return prevMistakes;
    });
  }, []);

  const handleSessionComplete = useCallback(() => {
    StorageService.saveSession({
      items: allQuestions,
      currentIndex: allQuestions.length,
    }); // Mark session as complete
    setCurrentView(View.Summary);
    toast.success("Session complete!");
  }, [allQuestions]);

  const handleNavigateHome = useCallback(() => {
    // Optionally clear session or ask user
    // For now, just navigates, session data remains for potential resume
    setCurrentView(View.Home);
  }, []);

  const handleClearAllData = useCallback(() => {
    setAllQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentMistakes([]);
    StorageService.clearSession();
    StorageService.clearMistakes();
    setCurrentView(View.Home);
    toast.info("All application data cleared.");
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <div className="text-2xl animate-pulse">
          Loading Your Study Space...
        </div>
      </div>
    );
  }

  const Header = () => (
    <header className="bg-slate-800 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 inline-block mr-2 text-sky-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>
          Memorization Master
        </h1>
        {currentView !== View.Home && (
          <button
            onClick={handleNavigateHome}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
              />
            </svg>
            Home
          </button>
        )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 w-full">
        {currentView === View.Home && (
          <HomePage
            onStartNewSession={handleStartNewSession}
            onReviewMistakes={handleReviewMistakes}
            currentMistakes={currentMistakes}
            allQuestions={allQuestions}
            currentQuestionIndex={currentQuestionIndex}
            onResumeSession={() => setCurrentView(View.Recitation)}
            onViewCurrentMistakes={() => setCurrentView(View.Summary)}
            onClearAllData={handleClearAllData}
          />
        )}
        {currentView === View.Recitation && allQuestions.length > 0 && (
          <RecitationPage
            qaList={allQuestions}
            startIndex={currentQuestionIndex}
            onAddToMistakes={handleAddToMistakes}
            onSessionComplete={handleSessionComplete}
            onUpdateCurrentIndex={(index) => {
              setCurrentQuestionIndex(index);
              StorageService.saveSession({
                items: allQuestions,
                currentIndex: index,
              });
            }}
          />
        )}
        {currentView === View.Summary && (
          <SummaryPage
            mistakes={currentMistakes}
            onReviewMistakesAsNewSession={handleReviewMistakes}
            onStartNewSession={() => {
              StorageService.clearSession(); // Clear session before starting truly new one from summary
              StorageService.clearMistakes();
              setAllQuestions([]);
              setCurrentQuestionIndex(0);
              setCurrentMistakes([]);
              setCurrentView(View.Home);
            }}
          />
        )}
      </main>
      <footer className="bg-slate-800 text-white text-center p-4 w-full mt-auto">
        <p>
          &copy; {new Date().getFullYear()} Memorization Master. Study Smart!
        </p>
      </footer>
    </div>
  );
};

export default App;
