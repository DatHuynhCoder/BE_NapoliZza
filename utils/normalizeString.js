export const normalizeString = (str) => {
  const accents = {
    a: /[àáâãäåāă]/g,
    e: /[èéêëēĕ]/g,
    i: /[ìíîïīĭ]/g,
    o: /[òóôõöōŏ]/g,
    u: /[ùúûüūŭ]/g,
    y: /[ýÿ]/g,
    d: /đ/g,
    A: /[ÀÁÂÃÄÅĀĂ]/g,
    E: /[ÈÉÊËĒĔ]/g,
    I: /[ÌÍÎÏĪĬ]/g,
    O: /[ÒÓÔÕÖŌŎ]/g,
    U: /[ÙÚÛÜŪŬ]/g,
    Y: /[ÝŸ]/g,
    D: /Đ/g,
  };

  //Nomalize string to lowercase
  let normalizedStr = str.trim().toLowerCase();
  Object.keys(accents).forEach((key) => {
    normalizedStr = normalizedStr.replace(accents[key], key);
  });

  return normalizedStr;
}