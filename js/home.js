import essen from "./essentials.js";

async function homeW() {
  const title = document.querySelector(".home .intro .title");
  const words = ["WE DESIGN", "WE DEVELOP", "WE CREATE", "WE ARE PVGIG"];

  words.forEach(async (e, i) => {
    setTimeout(() => {
      let s = e.split(" ");
      s.shift();

      if (i < 3) {
        s = s.join(" ");
        title.innerHTML = `<h1>WE </h1><span>${s}</span>`;
        s.split("").forEach((e, j) => {
          let interval;
          if (j < 1) interval = 750;
          else interval = 750 + j * 100;
          setTimeout(() => {
            const str = s.slice(0, s.length - j - 1);
            title.innerHTML = `<h1>WE </h1><span>${str}</span>`;
          }, interval);
        });
      } else {
        title.style.width = "1100px";
        setTimeout(() => {
          title.innerHTML = `<h1>WE </h1><span>${s[0]}</span><h1 class="name"> ${s[1]}</h1>`;
        }, 750);
      }
    }, 1750 * i);
  });
}

export default homeW;
