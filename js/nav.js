function navW() {
  const ham = document.querySelector("nav .ham");
  const links_menu = document.querySelector("nav .nav_links");
  const links = document.querySelectorAll("nav a");
  const message = document.querySelector("nav .message");
  const social = document.querySelector("nav .social");

  ham.addEventListener("click", () => {
    ham.classList.toggle("active");
    if (ham.classList.contains("active")) {
      links_menu.classList.add("active");
      setTimeout(() => {
        links.forEach((e, i) => {
          if (i < 3) e.classList.add("active");
          else {
            setTimeout(() => {
              e.classList.add("active");
            }, 250);
          }
        });
        message.classList.add("active");
        social.classList.add("active");
      }, 350);
    } else {
      links.forEach((e) => {
        e.classList.remove("active");
      });
      message.classList.remove("active");
      social.classList.remove("active");
      setTimeout(() => {
        links_menu.classList.remove("active");
      }, 100);
    }
  });
}

export default navW;
