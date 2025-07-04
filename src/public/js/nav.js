document.addEventListener("DOMContentLoaded", () => {
  const navbarToggler = document.getElementById("navbarToggler");
  const navbarNav = document.getElementById("navbarNav");
  const line1 = document.getElementById("line1");
  const line2 = document.getElementById("line2");
  const line3 = document.getElementById("line3");

  if (navbarToggler && navbarNav) {
    navbarToggler.addEventListener("click", () => {
      navbarNav.classList.toggle("hidden");

      // Animación del botón hamburguesa
      if (navbarNav.classList.contains("hidden")) {
        // Cerrado - volver a hamburguesa
        line1.style.transform = "rotate(0deg) translateY(0px)";
        line2.style.opacity = "1";
        line3.style.transform = "rotate(0deg) translateY(0px)";
      } else {
        // Abierto - convertir a X
        line1.style.transform = "rotate(45deg) translateY(6px)";
        line2.style.opacity = "0";
        line3.style.transform = "rotate(-45deg) translateY(-6px)";
      }
    });

    // Cerrar menú al hacer clic en un enlace (solo en móvil)
    const navLinks = navbarNav.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (
          !navbarNav.classList.contains("hidden") &&
          window.innerWidth < 1024
        ) {
          navbarNav.classList.add("hidden");
          // Resetear animación del botón
          line1.style.transform = "rotate(0deg) translateY(0px)";
          line2.style.opacity = "1";
          line3.style.transform = "rotate(0deg) translateY(0px)";
        }
      });
    });

    // Cerrar menú al redimensionar la ventana
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        navbarNav.classList.add("hidden");
        // Resetear animación del botón
        line1.style.transform = "rotate(0deg) translateY(0px)";
        line2.style.opacity = "1";
        line3.style.transform = "rotate(0deg) translateY(0px)";
      }
    });
  }
});
