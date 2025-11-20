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
    // 尝试从URL参数加载题库
    const urlParams = new URLSearchParams(window.location.search);
    const paramData = urlParams.get('data');
    
    let urlQuestions: QAItem[] | null = null;
    
    if (paramData) {
      try {
        // 尝试直接解析JSON
        let jsonStr = paramData;
        
        // 如果不是以 [ 或 { 开头，尝试Base64解码
        if (!jsonStr.trim().startsWith('[') && !jsonStr.trim().startsWith('{')) {
          try {
            jsonStr = atob(paramData);
          } catch (e) {
            console.warn('Base64解码失败，尝试直接解析:', e);
          }
        }
        
        // 解析JSON
        const parsed = JSON.parse(jsonStr);
        
        // 验证格式
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(
            (item) => typeof item.q === "string" && typeof item.a === "string"
          )
        ) {
          urlQuestions = parsed as QAItem[];
          toast.success(`从链接预加载了 ${urlQuestions.length} 道题目！`);
        } else {
          toast.error('URL参数中的题库格式无效');
        }
      } catch (error) {
        console.error('解析URL参数失败:', error);
        toast.error('解析URL参数失败，请检查数据格式');
      }
    }
    
    // 如果从URL加载成功，使用URL数据；否则尝试从本地存储加载
    if (urlQuestions) {
      setAllQuestions(urlQuestions);
      setCurrentQuestionIndex(0);
      setCurrentMistakes([]); // 清空错题本
      StorageService.saveSession({ items: urlQuestions, currentIndex: 0 });
      StorageService.saveMistakes([]);
      // 直接进入背诵页面
      setCurrentView(View.Recitation);
    } else {
      const loadedSession = StorageService.loadSession();
      const loadedMistakes = StorageService.loadMistakes();

      if (loadedSession && loadedSession.items.length > 0) {
        setAllQuestions(loadedSession.items);
        setCurrentQuestionIndex(loadedSession.currentIndex || 0);
      }
      if (loadedMistakes) {
        setCurrentMistakes(loadedMistakes);
      }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <div className="text-2xl font-semibold text-white animate-pulse">
            正在加载学习空间...
          </div>
        </div>
      </div>
    );
  }

  const Header = () => (
    <header className="glass-effect shadow-2xl w-full border-b border-white/20 backdrop-blur-xl">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center group">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10 mr-3 text-indigo-600 group-hover:scale-110 transition-transform duration-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            背诵大师
          </span>
        </h1>
        {currentView !== View.Home && (
          <button
            onClick={handleNavigateHome}
            className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 ease-in-out flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
              />
            </svg>
            返回首页
          </button>
        )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen flex flex-col relative">
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
        theme="light"
        toastClassName="backdrop-blur-sm bg-white/90"
      />
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 w-full relative z-10">
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
      <footer className="glass-effect border-t border-white/20 text-gray-700 text-center p-6 w-full mt-auto backdrop-blur-xl">
        <div className="flex items-center justify-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-indigo-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
          <p className="font-medium">
            &copy; {new Date().getFullYear()} 背诵大师 · 高效学习，智能记忆 · Made by OCYY
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
