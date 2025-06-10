
import { DiffSegment } from '../types';

// A very basic diffing utility. For more advanced diffs, a library like diff-match-patch would be better.
// This implementation focuses on simplicity for the given constraints.
// It generates a sequence of segments indicating common, added, or removed parts.
export const generateDiff = (text1: string, text2: string): DiffSegment[] => {
  // Normalize whitespace and split into words. Consider punctuation as part of words.
  const words1 = text1.trim().split(/(\s+)/).filter(Boolean); // Keep spaces as separate tokens
  const words2 = text2.trim().split(/(\s+)/).filter(Boolean); // Keep spaces as separate tokens

  const dp: number[][] = Array(words1.length + 1)
    .fill(null)
    .map(() => Array(words2.length + 1).fill(0));

  for (let i = 0; i <= words1.length; i++) {
    for (let j = 0; j <= words2.length; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i-1][j-1]); // Cost for substitution, deletion, insertion
      }
    }
  }

  const diff: DiffSegment[] = [];
  let i = words1.length;
  let j = words2.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && words1[i - 1] === words2[j - 1]) {
      diff.unshift({ value: words1[i - 1], type: 'common' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j])) {
       // Prefer addition if costs are equal or addition is cheaper
       if (i > 0 && j > 0 && dp[i][j-1] > dp[i-1][j-1] && dp[i-1][j] > dp[i-1][j-1] ){ // Part of a substitution
         diff.unshift({ value: words2[j - 1], type: 'added' });
         // diff.unshift({ value: words1[i - 1], type: 'removed' }); // Implicitly removed if we add here for substitution
         // i--; 
         j--;
       } else { // Pure addition
         diff.unshift({ value: words2[j - 1], type: 'added' });
         j--;
       }
    } else if (i > 0 && (j === 0 || dp[i - 1][j] < dp[i][j - 1])) {
       // Prefer deletion if costs are equal or deletion is cheaper (and not part of substitution already handled)
        if (i > 0 && j > 0 && dp[i-1][j] > dp[i-1][j-1] && dp[i][j-1] > dp[i-1][j-1] ){ // Part of a substitution
            // This case might be tricky if we already added. Let's simplify.
            // If we are here, it means word1[i-1] is not common and removing it is optimal path
             diff.unshift({ value: words1[i - 1], type: 'removed' });
             i--;
        } else { // Pure deletion
            diff.unshift({ value: words1[i - 1], type: 'removed' });
            i--;
        }
    } else { // This case should ideally not be hit if logic is correct for substitution
       // Fallback for substitution: mark word from text2 as added, word from text1 as removed
       if (j > 0) {
          diff.unshift({ value: words2[j - 1], type: 'added' });
          j--;
       }
       if (i > 0) {
         diff.unshift({ value: words1[i - 1], type: 'removed' });
         i--;
       }
    }
  }
  
  // Consolidate adjacent segments of the same type
  if (diff.length === 0) return [];
  const consolidatedDiff: DiffSegment[] = [diff[0]];
  for(let k = 1; k < diff.length; k++) {
    const lastSegment = consolidatedDiff[consolidatedDiff.length - 1];
    if (diff[k].type === lastSegment.type) {
        lastSegment.value += diff[k].value;
    } else {
        consolidatedDiff.push(diff[k]);
    }
  }

  return consolidatedDiff;
};

// Example usage and expected output structure:
// generateDiff("the quick brown fox", "the slow brown cat");
// [
//   { value: "the ", type: "common" },
//   { value: "quick", type: "removed" }, // or { value: "slow", type: "added" } first, depends on path
//   { value: "slow", type: "added" },   // then { value: "quick", type: "removed" }
//   { value: " brown ", type: "common" },
//   { value: "fox", type: "removed" },
//   { value: "cat", type: "added" }
// ]
// The simple LCS based diff might produce less intuitive "substitution" results, often showing as a removal then an addition.
// A true "diff-match-patch" style output is more complex. This aims for a basic word-level indication.
