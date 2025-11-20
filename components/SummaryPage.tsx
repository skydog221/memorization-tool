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
      toast.info("没有错题可以导出");
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
    toast.success("错题本导出成功！");
  };

  return (
    <div className="glass-effect shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-3xl mx-auto border border-white/20 animate-fadeIn">
      {/* 标题区域 */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          学习总结
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mx-auto"></div>
      </div>

      {mistakes.length === 0 ? (
        /* 无错题状态 */
        <div className="text-center py-12 animate-slideIn">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-full p-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-20 h-20 text-green-600 animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296A3.745 3.745 0 0 1 16.5 21a3.745 3.745 0 0 1-3.296-1.043A3.745 3.745 0 0 1 12 21a3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 7.5 21a3.745 3.745 0 0 1-3.296-1.043A3.745 3.745 0 0 1 3 18.296c-.963-.678-1.593-1.8-1.593-3.068a3.745 3.745 0 0 1 1.043-3.296A3.745 3.745 0 0 1 7.5 9c1.268 0 2.39.63 3.068 1.593A3.745 3.745 0 0 1 12 9c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 0 1 3.296 1.043A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            完美表现！
          </h3>
          <p className="text-lg text-gray-700">
            本次练习全部正确，继续保持！🎉
          </p>
        </div>
      ) : (
        /* 有错题状态 */
        <div className="animate-slideIn">
          {/* 错题统计 */}
          <div className="glass-effect rounded-xl p-5 mb-6 border border-red-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">本次错题数量</p>
                  <p className="text-2xl font-bold text-red-600">{mistakes.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">需要加强练习</p>
                <p className="text-lg font-semibold text-gray-700">继续努力！💪</p>
              </div>
            </div>
          </div>

          {/* 错题列表 */}
          <div className="max-h-96 overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar">
            {mistakes.map((item, index) => (
              <div 
                key={index} 
                className="group glass-effect rounded-xl p-5 border border-red-200/50 hover:border-red-300/70 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  {/* 序号徽章 */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* 内容区域 */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">问题</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-lg leading-relaxed">{item.q}</p>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">答案</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 操作按钮组 */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            {/* 导出按钮 */}
            <button
              onClick={handleExportMistakes}
              className="group w-full sm:w-auto flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 group-hover:animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              导出错题本
            </button>

            {/* 复习按钮 */}
            <button
              onClick={() => onReviewMistakesAsNewSession(mistakes)}
              className="group w-full sm:w-auto flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              复习这些错题
            </button>
          </div>
        </div>
      )}

      {/* 开始新会话按钮 */}
      <button
        onClick={onStartNewSession}
        className="group w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform duration-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
        返回首页，开始新会话
      </button>
    </div>
  );
};

export default SummaryPage;