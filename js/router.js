import homeW from "./home.js";
import navW from "./nav.js";
navW();

// Function to handle routing based on hash change
function handleHashChange() {
  const path = window.location.hash.substring(1); // Remove the '#' symbol
  loadPage(path);
}

// Function to load page content based on the hash path
function loadPage(path) {
  const container = document.getElementById("content");
  const request = new XMLHttpRequest();
  if (path == "") path = "home";
  request.open("GET", "pages/" + path + ".html");
  request.onload = async function () {
    if (request.status === 200) {
      container.innerHTML = request.responseText;
      navLinks(path);
      if (path == "home") homeW();
      // else {
      // }
    } else {
      container.innerHTML = "Page not found";
    }
  };
  request.send();
}

function navLinks(path) {
  const links = document.querySelectorAll(".nav_link");

  links.forEach((e) => {
    e.classList.remove("active");
  });

  links.forEach((e, i) => {
    if (i != 3 && essen.deCapitalize(e.innerHTML) == path) {
      e.classList.add("active");
    }
  });
}

// Add event listener for hashchange event
window.addEventListener("hashchange", handleHashChange);

// Initial page load
handleHashChange();
