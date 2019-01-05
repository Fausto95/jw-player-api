export default (length: number) => {
  let last: number|null = null;
  let repeat = 0;

  if (typeof length == 'undefined') length = 15;

  return () => {
    const now = Math.pow(10, 2) * +new Date();
    if (now == last) {
      repeat++;
    } else {
      repeat = 0;
      last = now;
    }

    const s = (now + repeat).toString();
    return +s.substr(s.length - length);
  };
};
