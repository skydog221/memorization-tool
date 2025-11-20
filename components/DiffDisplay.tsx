import React, { useRef, useState } from "react";
import { ChangeObject, diffChars } from "diff";

interface DiffDisplayProps {
  standard: string;
  user: string;
}

interface AlignedDiff {
  userDisplay: string;
  standardDisplay: string;
  type: "common" | "added" | "removed" | "substituted";
}

// 对齐diff，将diffChars的结果转换为更易于渲染和处理tooltip的结构
function alignDiffs(standard: string, user: string): AlignedDiff[] {
  const diffs = diffChars(standard, user);
  const result: AlignedDiff[] = [];

  for (let i = 0; i < diffs.length; i++) {
    const current = diffs[i];

    if (!current.added && !current.removed) {
      result.push({
        userDisplay: current.value,
        standardDisplay: current.value,
        type: "common",
      });
    } else if (current.removed && i + 1 < diffs.length && diffs[i + 1].added) {
      // 这是一个替换：标准答案移除了一部分，用户答案新增了一部分
      const next = diffs[i + 1];
      result.push({
        userDisplay: next.value, // 用户侧显示新增的部分
        standardDisplay: current.value, // 标准侧显示被移除的部分
        type: "substituted",
      });
      i++; // 跳过下一个已处理的 added 部分
    } else if (current.added) {
      // 纯粹的新增（只存在于用户答案中）
      result.push({
        userDisplay: current.value,
        standardDisplay: "",
        type: "added",
      });
    } else if (current.removed) {
      // 纯粹的移除（只存在于标准答案中）
      result.push({
        userDisplay: "",
        standardDisplay: current.value,
        type: "removed",
      });
    }
  }
  return result;
}

const DiffDisplay: React.FC<DiffDisplayProps> = ({ standard, user }) => {
  const aligned = alignDiffs(standard, user);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // 滚动同步
  const handleScroll = (from: "left" | "right") => {
    if (from === "left" && leftRef.current && rightRef.current) {
      rightRef.current.scrollTop = leftRef.current.scrollTop;
    } else if (from === "right" && leftRef.current && rightRef.current) {
      leftRef.current.scrollTop = rightRef.current.scrollTop;
    }
  };

  // 渲染一侧内容
  const renderSide = (side: "user" | "standard") =>
    aligned.map((seg, idx) => {
      const text = side === "user" ? seg.userDisplay : seg.standardDisplay;
      if (!text) return null;

      let color = "";
      if (seg.type === "added" && side === "user") {
        color = "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-b-2 border-green-400";
      } else if (seg.type === "removed" && side === "standard") {
        color = "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-b-2 border-red-400";
      } else if (seg.type === "substituted") {
        if (side === "user") {
          color = "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-b-2 border-amber-400";
        } else {
          color = "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-b-2 border-blue-400";
        }
      }

      return (
        <span
          key={idx}
          className={`${color} transition-all duration-200 hover:brightness-95 rounded px-0.5`}
        >
          {text}
        </span>
      );
    });

  return (
    <div className="relative">
      {/* 标题说明 */}
      <div className="mb-4 glass-effect rounded-xl p-4 border border-indigo-200/50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-200 to-emerald-200 rounded border-2 border-green-400"></div>
            <span className="text-gray-700">新增内容</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-200 to-rose-200 rounded border-2 border-red-400"></div>
            <span className="text-gray-700">缺失内容</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-amber-200 to-yellow-200 rounded border-2 border-amber-400"></div>
            <span className="text-gray-700">替换内容</span>
          </div>
        </div>
      </div>

      {/* 对比区域 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 用户答案 */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
            <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              你的答案
            </h3>
          </div>
          <div
            ref={leftRef}
            onScroll={() => handleScroll("left")}
            className="h-48 overflow-auto glass-effect border border-indigo-200/50 rounded-xl p-4 whitespace-pre-wrap text-base leading-relaxed shadow-lg hover:shadow-xl transition-shadow duration-300 custom-scrollbar"
          >
            {renderSide("user")}
          </div>
        </div>

        {/* 分隔符 */}
        <div className="hidden md:flex items-center justify-center">
          <div className="w-px h-48 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          <div className="absolute bg-white rounded-full p-2 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
        </div>

        {/* 标准答案 */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
            <h3 className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              标准答案
            </h3>
          </div>
          <div
            ref={rightRef}
            onScroll={() => handleScroll("right")}
            className="h-48 overflow-auto glass-effect border border-green-200/50 rounded-xl p-4 whitespace-pre-wrap text-base leading-relaxed shadow-lg hover:shadow-xl transition-shadow duration-300 custom-scrollbar"
          >
            {renderSide("standard")}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DiffDisplay;