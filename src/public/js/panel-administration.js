function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("mobile-menu-icon");

  if (mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.remove("hidden");
    mobileMenu.classList.add("animate-slide-down");
    menuIcon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
  } else {
    mobileMenu.classList.add("hidden");
    mobileMenu.classList.remove("animate-slide-down");
    menuIcon.innerHTML =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
  }
}

const logout = async () => {
  try {
    const response = await fetch("/login/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    if (response.ok) {
      Swal.fire("Éxito", result.successMessage, "success").then(() => {
        setTimeout(() => {
          Swal.close();
          window.location.href = "/";
        }, 1000);
      });
    } else {
      Swal.fire("Error", result.errorMessage, "error");
    }
  } catch (error) {
    console.error(`Error in logout function: ${error}`);
  }
};
