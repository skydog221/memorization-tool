import React, { useState, useEffect, useCallback } from "react";
import { QAItem } from "../types";
import DiffDisplay from "./DiffDisplay";
import { toast } from "react-toastify";

interface RecitationPageProps {
  qaList: QAItem[];
  startIndex?: number;
  onAddToMistakes: (item: QAItem) => void;
  onSessionComplete: () => void;
  onUpdateCurrentIndex: (index: number) => void;
}

const RecitationPage: React.FC<RecitationPageProps> = ({
  qaList,
  startIndex = 0,
  onAddToMistakes,
  onSessionComplete,
  onUpdateCurrentIndex,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(startIndex);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isMarkedAsMistake, setIsMarkedAsMistake] = useState<boolean>(false);

  useEffect(() => {
    setCurrentIndex(startIndex);
    setUserAnswer("");
    setShowDiff(false);
    setIsSubmitted(false);
    setIsMarkedAsMistake(false);
  }, [qaList, startIndex]);

  // Update parent about index change for persistence
  useEffect(() => {
    onUpdateCurrentIndex(currentIndex);
  }, [currentIndex, onUpdateCurrentIndex]);

  const currentQA = qaList[currentIndex];

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowDiff(true);
    // 不自动加入错题本，仅展示diff
    if (userAnswer.trim() === currentQA.a.trim()) {
      toast.success("回答正确！");
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < qaList.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setUserAnswer("");
      setShowDiff(false);
      setIsSubmitted(false);
      setIsMarkedAsMistake(false);
    } else {
      onSessionComplete();
    }
  };

  const handleMarkMistake = () => {
    if (!isMarkedAsMistake) {
      onAddToMistakes(currentQA);
      setIsMarkedAsMistake(true);
      toast.success("已加入错题本！");
    } else {
      toast.info("已加入过错题本。");
    }
  };

  if (!currentQA) {
    return (
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        未加载到题目或答题已结束。
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / qaList.length) * 100;

  return (
    <div className="glass-effect shadow-2xl rounded-2xl p-4 sm:p-6 w-full max-w-3xl mx-auto border border-white/20 animate-fadeIn">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 text-sm font-medium">
          <span className="flex items-center text-indigo-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 mr-1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
            第 {currentIndex + 1} 题 / 共 {qaList.length} 题
          </span>
          <span className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {progressPercentage.toFixed(0)}% 完成
          </span>
        </div>
        <div className="relative w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 min-h-[100px] flex items-center shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full -ml-12 -mb-12"></div>
        <p className="text-xl font-bold text-gray-800 relative z-10 leading-relaxed">{currentQA.q}</p>
      </div>

      {!showDiff ? (
        <>
          <textarea
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300 ease-in-out mb-4 font-sans text-base bg-white/90 backdrop-blur-sm hover:bg-white resize-none"
            placeholder="💭 请在此输入你的答案..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="group w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
            <span className="relative z-10 text-lg">提交答案</span>
          </button>
        </>
      ) : (
        <div className="p-6 border-2 border-indigo-200 rounded-2xl bg-gradient-to-br from-white to-indigo-50/30 shadow-xl animate-fadeIn">
          <div className="flex items-center mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7 text-indigo-600 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
            <h3 className="text-lg font-bold text-gray-800">
              答案对比
            </h3>
          </div>
          <DiffDisplay standard={currentQA.a} user={userAnswer} />
          <div className="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleMarkMistake}
              disabled={isMarkedAsMistake}
              className={`w-full sm:w-auto flex-1 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center ${
                isMarkedAsMistake
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white transform hover:scale-105"
              }`}
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
                  d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                />
              </svg>
              {isMarkedAsMistake ? "已加入错题本" : "加入错题本"}
            </button>
            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              {currentIndex < qaList.length - 1 ? (
                <>
                  下一题
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 ml-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </>
              ) : (
                "完成答题"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecitationPage;
