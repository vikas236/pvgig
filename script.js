function cursorW() {
  const cursor = document.querySelector(".cursor");

  document.addEventListener("mousemove", (e) => {
    cursor.style.opacity = 1;
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
    changeCursorColor(cursor, e);
  });

  document.addEventListener("mouseout", (e) => {
    cursor.style.opacity = 0;
  });
}
// cursorW();

function changeCursorColor(cursor, e) {
  const h1 = document.querySelector(".intro h1");

  console.log(h1.classList);

  // console.log(e.target, e.target.style.color);
  // console.log(e.target.style.color, e.target.style.background);
}
