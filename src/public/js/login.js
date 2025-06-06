function togglePassword() {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                `;
  } else {
    passwordInput.type = "password";
    eyeIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                `;
  }
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

let title = "Error de Acceso";
let message = "";
let icon = "error"; // Icono por defecto para errores

// Comprobar si hay un parámetro 'error' en la URL
const errorType = getQueryParam("error");

switch (errorType) {
  case "no_auth":
    message = "No tienes autorización. Por favor, inicia sesión.";
    break;
  case "invalid_token":
    message =
      "Tu sesión ha expirado o el token es inválido. Por favor, inicia sesión nuevamente.";
    break;
  default:
    // No hay error o es un error desconocido, no mostrar nada
    message = ""; // Asegúrate de que el mensaje esté vacío para no mostrar la alerta
    break;
}

// Si hay un mensaje, mostrar la alerta con SweetAlert2
if (message) {
  Swal.fire({
    title: title,
    text: message,
    icon: icon,
    confirmButtonText: "Entendido",
    customClass: {
      container: "my-swal-container", // Clase personalizada para el contenedor
      popup: "my-swal-popup", // Clase personalizada para el popup
      confirmButton: "my-swal-button", // Clase personalizada para el botón
    },
  });
}

// Form submission handler
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = document.getElementById("login-button");

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const data = {
    username: username,
    password: password,
  };

  // Show loading state
  button.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
            `;

  button.disabled = true;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });


    const result = await response.json();

    
    if (response.ok) {
      button.disabled = false;
      Swal.fire("Éxito", result.successMessage, "success").then(() => {
        setTimeout(() => {
          Swal.close();
          window.location.href = "/admin/users";
        }, 1000);
      });
    } else {
      button.disabled = false;
      let errorMessage = result.errorMessage;

      if (
        result.errors &&
        Array.isArray(result.errors) &&
        result.errors.length > 0
      ) {
        errorMessage += `\n\n` + result.errors.join("\n");
      }

      Swal.fire("Error", errorMessage, "error");
    }
  } catch (error) {
    button.disabled = false;
    console.error("Error al enviar la solicitud:", error);
    Swal.fire(
      "Error",
      "Error de conexión o inesperado. Inténtalo de nuevo.",
      "error"
    );
  }
});

// Add fade-in animation to form elements
document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll("input, button, a");
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
    el.classList.add("animate-fade-in");
  });
});
