const essen = (async () => {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return { sleep };
})();

export default essen;
