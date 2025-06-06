const modalAdd = document.querySelector(".modal");
const modalClose = document.querySelectorAll(".modal-close");

function openAddModal(buttonElement) {
  modalAdd.classList.remove("opacity-0");
  modalAdd.classList.remove("pointer-events-none");

  parametro = buttonElement.dataset.parametro;
  des = buttonElement.dataset.des;
  document.getElementById(
    "parametro"
  ).textContent = `Agregar valor de: ${parametro} `;
}

modalClose.forEach((close) => {
  close.addEventListener("click", () => {
    modalAdd.classList.add("opacity-0");
    modalAdd.classList.add("pointer-events-none");
  });
});

let parametro = "";
let des = "";
const button = document.getElementById("btnAdd");

button.addEventListener("click", async (e) => {
  e.preventDefault();

  const valor = document.getElementById("valueAdd").value.trim();
  const precio = parseFloat(document.getElementById("priceAdd").value.trim());

  const data = {
    valor,
    precio,
    parametro_nombre: parametro,
    descripcion: des,
  };

  try {
    const response = await fetch(`/admin/quoters/cameras`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    button.disabled = true;

    if (response.ok) {
      button.disabled = false;
      Swal.fire("Éxito", result.successMessage, "success").then(() => {
        setTimeout(() => {
          Swal.close();
          window.location.href = "/admin/quoters/cameras";
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
