function navW() {
  const body = document.querySelector("body");
  const ham = document.querySelector("nav .ham");
  const links_menu = document.querySelector("nav .nav_links");
  const links = document.querySelectorAll("nav a");
  const message = document.querySelector("nav .message");
  const social = document.querySelector("nav .social");

  ham.addEventListener("click", () => {
    ham.classList.toggle("active");
    if (ham.classList.contains("active")) openNavigation();
    else closeNavigation();

    function openNavigation() {
      addWall();
      links_menu.classList.add("active");
      setTimeout(() => {
        links.forEach((e, i) => {
          if (i < 3) e.className = "visible active";
          else {
            setTimeout(() => {
              e.className = "active visible";
            }, 250);
          }
        });
        message.className = "message active visible";
        social.className = "social active visible";
      }, 350);
    }

    function addWall() {
      const div = document.createElement("div");
      div.classList.add("ham_wall");
      body.appendChild(div);
      body.style.height = "100vh";
      body.style.overflow = "hidden";

      div.addEventListener("click", () => {
        body.style.height = "fit-content";
        body.style.overflow = "visible";
        closeNavigation();
      });
    }

    function closeNavigation() {
      const ham_wall = document.querySelector(".ham_wall");
      const ham = document.querySelector("nav .ham");
      ham.classList.remove("active");
      ham_wall.remove();

      links.forEach((e) => {
        e.className = "active";
      });
      message.className = "message active";
      social.className = "social active";

      setTimeout(() => {
        links.forEach((e) => {
          e.className = "";
        });
        message.className = "message";
        social.className = "social";
      }, 100);
      setTimeout(() => {
        links_menu.classList.remove("active");
      }, 50);
    }
  });
}

export default navW;
