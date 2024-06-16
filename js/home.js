import essen from "./essentials.js";

async function homeW() {
  let section_no = 0;
  const title = document.querySelector(".home .intro .title");
  const words = ["WE DESIGN", "WE DEVELOP", "WE CREATE", "WE ARE PVGIG"];
  let movement = false;

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
        title.classList.add("active");
        setTimeout(() => {
          title.innerHTML = `<h1>WE </h1><span>${s[0]}</span><h1 class="name"> ${s[1]}</h1>`;
        }, 750);
      }
    }, 1750 * i);
  });

  setTimeout(() => {
    const container = document.querySelector(".subtext");
    let sentence = "tranform your idea into a webpage";

    let s = sentence.split("");
    for (let i = 0; i < s.length + 1; i++) {
      setTimeout(() => {
        let html_content = s
          .slice(0, i + 1)
          .join("")
          .toUpperCase();
        if (i == s.length) {
          setTimeout(() => {
            html_content += `<i class="fa-solid fa-caret-down"></i>`;
            container.innerHTML = html_content;
          }, 500);
        }

        container.innerHTML = html_content;
      }, 25 * i);
    }
  }, 1750 * 4);

  const home = document.querySelector(".home");

  home.addEventListener("wheel", (e) => {
    playerActivity();
    if (e.deltaY > 0 && section_no < 3) moveDown();
    else if (e.deltaY < 0 && section_no > 0) moveUp();
    setTimeout(() => {
      home.style.top = -100 * section_no + "vh";
    }, 200);
  });

  document.addEventListener("keydown", (e) => {
    playerActivity();
    if (
      (e.key == "ArrowDown" || e.key == "PageDown" || e.key == " ") &&
      section_no < 3
    )
      moveDown();
    else if ((e.key == "ArrowUp" || e.key == "PageUp") && section_no > 0)
      moveUp();

    if (e.key == "Home") section_no = 0;
    if (e.key == "End") section_no = 3;

    setTimeout(() => {
      home.style.top = -100 * section_no + "vh";
    }, 200);
  });

  function touchMovement() {
    let startY = 0;
    let direction;

    document.addEventListener("touchstart", (e) => {
      // Get the initial touch position
      startY = e.touches[0].clientY;
    });

    document.addEventListener("touchmove", (e) => {
      const currentY = e.touches[0].clientY;
      const diffY = startY - currentY;

      if (diffY > 5) {
        direction = "down";
      } else if (diffY < -5) {
        direction = "up";
      }
    });

    document.addEventListener("touchend", () => {
      playerActivity();
      // Reset the text content when the touch ends
      if (direction == "down" && section_no < 3) moveDown();
      else if (direction == "up" && section_no > 0) moveUp();

      setTimeout(() => {
        home.style.top = -100 * section_no + "vh";
      }, 200);
    });
  }
  touchMovement();

  function moveDown() {
    if (!movement) {
      section_no++;
      movement = true;
      setTimeout(() => {
        movement = false;
      }, 750);
    }
  }

  function moveUp() {
    if (!movement) {
      section_no--;
      movement = true;
      setTimeout(() => {
        movement = false;
      }, 750);
    }
  }

  function playerActivity() {
    const player = document.querySelectorAll(".our_beliefs img");

    setTimeout(() => {
      if (section_no == 1) {
        player.forEach((e) => {
          e.classList.add("active");
        });
      } else {
        player.forEach((e) => {
          e.classList.remove("active");
        });
      }
    }, 500);
  }

  function playBookImage() {
    const container = document.querySelector(".our_playbook .image");
    container.addEventListener("mousemove", (e) => {
      const img = container.querySelector(".our_playbook img");

      const { clientX, clientY } = e;
      const { offsetWidth, offsetHeight } = container;
      const { left, top } = container.getBoundingClientRect();

      const centerX = left + offsetWidth / 2;
      const centerY = top + offsetHeight / 2;

      const percentX = (clientX - centerX) / (offsetWidth / 2);
      const percentY = (clientY - centerY) / (offsetHeight / 2);

      const rotateY = percentX * 20;
      const rotateX = -percentY * 20;

      img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    container.addEventListener("mouseleave", () => {
      const img = document.querySelector(".image-container img");
      img.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }
  playBookImage();
}

export default homeW;
