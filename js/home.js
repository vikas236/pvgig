import essen from "./essentials.js";

async function homeW() {
  const title = document.querySelector(".home .intro h1");
  const words = ["WE DESIGN", "WE DEVELOP", "WE CREATE", "WE ARE PVGIG"];

  words.forEach(async (e, i) => {
    setTimeout(() => {
      let s = e.split(" ");
      s.shift();

      if (i < 3) {
        s = s.join(" ");
        title.innerHTML = `WE <span>${s}</span>`;
        s.split("").forEach((e, j) => {
          let interval;
          if (j < 1) interval = 750;
          else interval = 750 + j * 100;
          setTimeout(() => {
            const str = s.slice(0, s.length - j - 1);
            title.innerHTML = `WE <span>${str}</span>`;
            console.log(j, interval);
          }, interval);
        });
      } else {
        title.style.width = "1050px";
        setTimeout(() => {
          title.innerHTML = `WE <span>${s[0]}</span> ${s[1]}`;
        }, 750);
      }

      const name = title.childNodes[2];
      // if (name) console.log(name.textContent);
    }, 1750 * i);
  });
}

export default homeW;
