function openDeleteModal(buttonElement) {
  const id = buttonElement.dataset.id;
  const valor = buttonElement.dataset.valor;

  document.getElementById(
    "deleteItemName"
  ).textContent = `El valor de ${valor}`;

  document.getElementById("deleteItemId").value = id;

  document.getElementById("deleteModal").classList.remove("hidden");
  document.getElementById("deleteModal").classList.add("flex");
}

function closeDeleteModal() {
  document.getElementById("deleteModal").classList.add("hidden");
  document.getElementById("deleteModal").classList.remove("flex");
  cameraToDelete = null;
}

document.getElementById("deleteModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeDeleteModal();
  }
});

// Close modals with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    closeDeleteModal();
  }
});

function confirmDelete() {
  const id = document.getElementById("deleteItemId").value;

  fetch(`/admin/quoters/cameras/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.successMessage) {
        Swal.fire("Éxito", data.successMessage, "success").then(() => {
          setTimeout(() => {
            Swal.close();
            window.location.href = "/admin/quoters/cameras";
          }, 1000);
        });
      } else {
        Swal.fire("Error", data.errorMessage, "error");
      }
    })
    .catch((error) => {
      console.error("Error al eliminar el parámetro:", error);
      Swal.fire("Error", "Ocurrió un error al eliminar el parámetro.", "error");
    });

  closeDeleteModal();
}
