// xorUtil.js
export const xorEncrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(code);
  }
  // Mã hóa xong, chuyển sang base64 để dễ truyền
  return Buffer.from(result).toString('base64');
}