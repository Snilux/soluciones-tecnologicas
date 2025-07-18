let editingItemId;

function openEditModal(buttonElement) {
  // Access data attributes using dataset
  const itemId = buttonElement.dataset.id;
  const itemValor = buttonElement.dataset.valor;
  const itemPrecio = buttonElement.dataset.precio;
  const parametroNombre = buttonElement.dataset.parametro;

  // console.log(`Editing item ID: ${itemId}, Valor: ${itemValor}, Precio: ${itemPrecio}, Parametro Nombre: ${parametroNombre}`);

  editingItemId = itemId;
  document.getElementById(
    "modalTitle"
  ).textContent = `Editar ${parametroNombre} (${itemValor})`;
  document.getElementById("submitBtn").textContent = "Guardar Cambios";

  document.getElementById("modalValor").value = itemValor;
  document.getElementById("modalPrecio").value = itemPrecio;

  document.getElementById("modalId").value = itemId;

  document.getElementById("cameraModal").classList.remove("hidden");
  document.getElementById("cameraModal").classList.add("flex");
}

function closeModal() {
  document.getElementById("cameraModal").classList.add("hidden");
  document.getElementById("cameraModal").classList.remove("flex");
  editingCameraId = null;
}

document.getElementById("cameraModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeModal();
  }
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = document.getElementById("submitBtn");

  const modalValor = document.getElementById("modalValor").value;
  const modalPrecio = parseFloat(document.getElementById("modalPrecio").value);
  const modalId = document.getElementById("modalId").value;

  const data = {
    valor: modalValor,
    precio: modalPrecio,
  };

  try {
    const response = await fetch(`/admin/quoters/cameras/${modalId}`, {
      method: "PUT",
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
