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
    if (!userAnswer.trim()) {
      toast.error("答案不能为空。");
      return;
    }
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
    <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
          <span>
            第 {currentIndex + 1} 题 / 共 {qaList.length} 题
          </span>
          <span>{progressPercentage.toFixed(0)}% 完成</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-sky-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200 min-h-[100px] flex items-center">
        <p className="text-xl font-semibold text-gray-700">{currentQA.q}</p>
      </div>

      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out mb-4"
        placeholder="请输入你的答案..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        disabled={isSubmitted}
      />

      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
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
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          提交答案
        </button>
      )}

      {showDiff && (
        <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            答案对比：
          </h3>
          <DiffDisplay standard={currentQA.a} user={userAnswer} />
          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
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
