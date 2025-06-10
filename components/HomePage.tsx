import React, { useState, ChangeEvent } from "react";
import { QAItem } from "../types";
import { toast } from "react-toastify";

interface HomePageProps {
  onStartNewSession: (questions: QAItem[]) => void;
  onReviewMistakes: (questions: QAItem[]) => void;
  currentMistakes: QAItem[];
  allQuestions: QAItem[];
  currentQuestionIndex: number;
  onResumeSession: () => void;
  onViewCurrentMistakes: () => void;
  onClearAllData: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onStartNewSession,
  onReviewMistakes,
  currentMistakes,
  allQuestions,
  currentQuestionIndex,
  onResumeSession,
  onViewCurrentMistakes,
  onClearAllData,
}) => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [inputError, setInputError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateAndParseJson = (input: string): QAItem[] | null => {
    try {
      const parsed = JSON.parse(input);
      if (
        !Array.isArray(parsed) ||
        !parsed.every(
          (item) => typeof item.q === "string" && typeof item.a === "string"
        )
      ) {
        setInputError(
          'JSON 格式无效。期望是一个包含 "q" 和 "a" 字符串属性的对象数组。例如：[{"q":"问题","a":"答案"}]'
        );
        return null;
      }
      setInputError("");
      return parsed as QAItem[];
    } catch (error) {
      setInputError("JSON 内容无效。请检查语法错误。");
      return null;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setJsonInput("");
      setInputError("");
    } else {
      setSelectedFile(null);
    }
  };

  const handleProcessInput = (isReview: boolean) => {
    let contentToParse: string = jsonInput;

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        const questions = validateAndParseJson(fileContent);
        if (questions) {
          if (questions.length === 0) {
            setInputError("不能从空的问题集开始。");
            toast.error("不能从空的问题集开始。");
            return;
          }
          if (isReview) {
            onReviewMistakes(questions);
          } else {
            onStartNewSession(questions);
          }
          setJsonInput("");
          setSelectedFile(null);
        } else {
          toast.error(inputError || "解析 JSON 文件失败。");
        }
      };
      reader.onerror = () => {
        toast.error("读取文件失败。");
      };
      reader.readAsText(selectedFile);
    } else if (jsonInput.trim()) {
      const questions = validateAndParseJson(jsonInput);
      if (questions) {
        if (questions.length === 0) {
          setInputError("不能从空的问题集开始。");
          toast.error("不能从空的问题集开始。");
          return;
        }
        if (isReview) {
          onReviewMistakes(questions);
        } else {
          onStartNewSession(questions);
        }
        setJsonInput("");
      } else {
        toast.error(inputError || "解析 JSON 失败。");
      }
    } else {
      toast.error("请输入 JSON 内容或上传文件。");
      setInputError("请输入 JSON 内容或上传文件。");
    }
  };

  const hasActiveSession =
    allQuestions.length > 0 && currentQuestionIndex < allQuestions.length;

  const exampleJson = '[{"q":"React 是什么？","a":"一个 JavaScript 库。"}]';

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          新建或导入题库
        </h2>
        <p className="text-gray-600 mb-4">
          请在下方输入你的题目和答案（JSON 格式），或直接上传 JSON 文件。例如：
          <code>{exampleJson}</code>
        </p>
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out mb-4"
          placeholder='[{"q":"你的问题1","a":"你的答案1"}, {"q":"你的问题2","a":"你的答案2"}]'
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setSelectedFile(null);
            if (inputError) setInputError("");
          }}
          disabled={!!selectedFile}
        />
        <div className="mb-4">
          <label
            htmlFor="json-file-upload"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            或选择 JSON 文件上传：
          </label>
          <input
            id="json-file-upload"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              已选择文件: {selectedFile.name}
            </p>
          )}
        </div>
        {inputError && (
          <p className="text-red-500 text-sm mt-2">{inputError}</p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => handleProcessInput(false)}
            className="w-full sm:w-auto flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
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
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
            新建背诵
          </button>
          <button
            onClick={() => handleProcessInput(true)}
            className="w-full sm:w-auto flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            导入错题本并复习
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          数据管理
        </h2>
        <div className="space-y-4">
          {hasActiveSession && (
            <button
              onClick={onResumeSession}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
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
                  d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z"
                />
              </svg>
              继续背诵（剩余 {allQuestions.length - currentQuestionIndex} 题）
            </button>
          )}
          {currentMistakes.length > 0 && (
            <button
              onClick={onViewCurrentMistakes}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
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
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
              查看/导出错题本（{currentMistakes.length} 条）
            </button>
          )}
          {(allQuestions.length > 0 || currentMistakes.length > 0) && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "确定要清空所有背诵数据和错题本吗？此操作不可撤销。"
                  )
                ) {
                  onClearAllData();
                }
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
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
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              清空所有数据
            </button>
          )}
          {!hasActiveSession && currentMistakes.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              暂无背诵数据或错题本，请先录入题目！
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
