export function showModal(modalOverlay) {
    modalOverlay.classList.add("show");
}
export function hideModal(modalOverlay) {
    modalOverlay.classList.remove("show");
    // Nettoyage des champs si c'est la modale de détails
    if (modalOverlay.id === "detailsModalOverlay") {
        document.getElementById("foodNameInput").value = "";
        document.getElementById("foodQuantityInput").value = "";
        document.getElementById("dishNameInput").value = "";
        document.getElementById("ingredientsList").innerHTML = "";
        document.getElementById("errorMessage").classList.add("hidden");
        document.getElementById("errorMessage").textContent = "";
    }
}
