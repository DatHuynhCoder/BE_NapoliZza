export const xorDecrypt = (base64, key) => {
  const text = atob(base64);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(code);
  }
  return result;
}