import { normalizeString } from "./normalizeString.js";

export const search = (keyword) => {
  if (!keyword) return null;

  const normalizedKeyword = normalizeString(keyword);

  // Escape các ký tự đặc biệt trong regex
  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return {
      keyword,
      normalized: normalizedKeyword,
      regex: new RegExp(escapedKeyword, "i"),
  };
}