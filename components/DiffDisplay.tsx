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
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

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
        color = "bg-green-200 text-green-800";
      } else if (seg.type === "removed" && side === "standard") {
        color = "bg-red-200 text-red-800"; // 移除 line-through
      } else if (seg.type === "substituted") {
        if (side === "user") {
          color = "bg-green-200 text-green-800";
        } else {
          color = "bg-red-200 text-red-800";
        }
      }

      // Tooltip 逻辑
      let tooltipContent = "";
      let shouldShowTooltip = false;

      if (seg.type === "substituted") {
        shouldShowTooltip = true;
        tooltipContent =
          side === "user"
            ? `标准答案：${seg.standardDisplay}`
            : `你的答案：${seg.userDisplay}`;
      } else if (seg.type === "added" && side === "user") {
        shouldShowTooltip = true;
        tooltipContent = "标准答案此处无此内容";
      } else if (seg.type === "removed" && side === "standard") {
        shouldShowTooltip = true;
        tooltipContent = "你的答案此处无此内容";
      }

      return (
        <span
          key={idx}
          className={color}
          onMouseEnter={
            shouldShowTooltip
              ? (e) => {
                  setTooltip({
                    text: tooltipContent,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }
              : undefined
          }
          onMouseLeave={shouldShowTooltip ? () => setTooltip(null) : undefined}
        >
          {text}
        </span>
      );
    });

  return (
    <div className="relative flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="font-semibold text-gray-600 mb-1">你的答案</div>
        <div
          ref={leftRef}
          onScroll={() => handleScroll("left")}
          className="h-40 overflow-auto border border-gray-300 rounded bg-white p-2 whitespace-pre-wrap text-base font-mono"
        >
          {renderSide("user")}
        </div>
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-600 mb-1">标准答案</div>
        <div
          ref={rightRef}
          onScroll={() => handleScroll("right")}
          className="h-40 overflow-auto border border-gray-300 rounded bg-white p-2 whitespace-pre-wrap text-base font-mono"
        >
          {renderSide("standard")}
        </div>
      </div>
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            zIndex: 1000,
          }}
          className="pointer-events-none bg-black bg-opacity-80 text-white text-xs rounded px-2 py-1 shadow-lg"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default DiffDisplay;
