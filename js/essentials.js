const essen = (() => {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function scrollActivity(n) {
    const content = document.querySelector("#content");
    if (n) {
      content.style.overflowY = "visible";
      content.style.height = "fit-content";
    } else {
      content.style.overflowY = "hidden";
      content.style.height = "100vh";
    }
    content.scrollTop = 0;
  }

  return { sleep, scrollActivity };
})();

export default essen;
