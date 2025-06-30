import {
    renderFoodList,
    addEntry,
    dailyEntries,
    initializeApp,
} from "./food.js";
import { showModal, hideModal } from "./modal.js";
import { estimateCaloriesWithGemini } from "./gemini.js";

// Constantes et éléments DOM
const MAX_CALORIES = 1300;
const resetButton = document.querySelector("#resetButton");
const addButton = document.getElementById("addButton");
const choiceModalOverlay = document.getElementById("choiceModalOverlay");
const addSimpleFoodBtn = document.getElementById("addSimpleFoodBtn");
const addDishBtn = document.getElementById("addDishBtn");
const dishNameInput = document.getElementById("dishNameInput");
const dishForm = document.getElementById("dishForm");
const simpleFoodForm = document.getElementById("simpleFoodForm");
const addIngredientBtn = document.getElementById("addIngredientBtn");
const ingredientsList = document.getElementById("ingredientsList");
const closeChoiceModalBtn = document.getElementById("closeChoiceModalBtn");
const detailsModalOverlay = document.getElementById("detailsModalOverlay");
const detailsModalTitle = document.getElementById("detailsModalTitle");
const foodNameInput = document.getElementById("foodNameInput");
const foodQuantityInput = document.getElementById("foodQuantityInput");
const submitFoodBtn = document.getElementById("submitFoodBtn");
const submitFoodBtnText = document.getElementById("submitFoodBtnText");
const closeDetailsModalBtn = document.getElementById("closeDetailsModalBtn");
const errorMessage = document.getElementById("errorMessage");

let currentFoodType = "";
let ingredients = [];

resetButton.onclick = () => {
    if (
        confirm(
            "Êtes-vous sûr de vouloir réinitialiser la liste des aliments ? Toutes les données seront perdues."
        )
    ) {
        dailyEntries.length = 0; // Vide le tableau des entrées
        localStorage.removeItem("dailyEntries"); // Supprime les données du stockage local
        renderFoodList(); // Met à jour l'affichage
    }
};

// Gestion des modales
addButton.onclick = () => showModal(choiceModalOverlay);
closeChoiceModalBtn.onclick = () => hideModal(choiceModalOverlay);

addSimpleFoodBtn.onclick = () => {
    currentFoodType = "simple";
    detailsModalTitle.textContent = "Ajouter un aliment simple";
    simpleFoodForm.classList.remove("hidden");
    dishForm.classList.add("hidden");
    hideModal(choiceModalOverlay);
    showModal(detailsModalOverlay);
};

addDishBtn.onclick = () => {
    currentFoodType = "dish";
    detailsModalTitle.textContent = "Ajouter un plat";
    simpleFoodForm.classList.add("hidden");
    dishForm.classList.remove("hidden");
    ingredients = [];
    addIngredient();
    hideModal(choiceModalOverlay);
    showModal(detailsModalOverlay);
};

addIngredientBtn.onclick = addIngredient;
closeDetailsModalBtn.onclick = () => hideModal(detailsModalOverlay);

function addIngredient() {
    const ingredientDiv = document.createElement("div");
    ingredientDiv.className = "ingredient-item";
    ingredientDiv.innerHTML = `
        <button type="button" class="remove-ingredient" onclick="removeIngredient(this)">×</button>
        <input type="text" placeholder="Nom de l'ingrédient" class="ingredient-name">
        <input type="text" placeholder="Quantité (ex: 100g, 1 cuillère)" class="ingredient-quantity">
    `;
    ingredientsList.appendChild(ingredientDiv);
}

window.removeIngredient = function (button) {
    button.parentElement.remove();
};

submitFoodBtn.onclick = async () => {
    if (currentFoodType === "simple") {
        // Code existant pour aliment simple
        const name = foodNameInput.value.trim();
        const quantity = foodQuantityInput.value.trim();
        if (!name || !quantity) {
            errorMessage.textContent = "Veuillez remplir tous les champs.";
            errorMessage.classList.remove("hidden");
            return;
        }
        errorMessage.classList.add("hidden");
        submitFoodBtn.disabled = true;
        submitFoodBtnText.innerHTML =
            '<div class="loading-spinner"></div> Estimation...';
        try {
            const calories = await estimateCaloriesWithGemini(name, quantity);
            if (calories === 0) {
                errorMessage.textContent =
                    "Estimation impossible. Essayez une description plus précise.";
                errorMessage.classList.remove("hidden");
                return;
            }
            await addEntry({ name, quantity, calories });
            hideModal(detailsModalOverlay);
        } catch (e) {
            errorMessage.textContent = "Erreur lors de l'estimation.";
            errorMessage.classList.remove("hidden");
        } finally {
            submitFoodBtn.disabled = false;
            submitFoodBtnText.textContent = "Ajouter et estimer";
        }
    } else if (currentFoodType === "dish") {
        // Nouveau code pour plat avec ingrédients
        const dishName = dishNameInput.value.trim();
        const ingredientItems = document.querySelectorAll(".ingredient-item");

        if (!dishName || ingredientItems.length === 0) {
            errorMessage.textContent =
                "Veuillez remplir le nom du plat et ajouter au moins un ingrédient.";
            errorMessage.classList.remove("hidden");
            return;
        }

        let totalCalories = 0;
        let ingredientsList = [];

        submitFoodBtn.disabled = true;
        submitFoodBtnText.innerHTML =
            '<div class="loading-spinner"></div> Estimation...';

        try {
            for (const item of ingredientItems) {
                const name = item
                    .querySelector(".ingredient-name")
                    .value.trim();
                const quantity = item
                    .querySelector(".ingredient-quantity")
                    .value.trim();

                if (!name || !quantity) {
                    errorMessage.textContent =
                        "Veuillez remplir tous les ingrédients.";
                    errorMessage.classList.remove("hidden");
                    return;
                }

                const calories = await estimateCaloriesWithGemini(
                    name,
                    quantity
                );
                totalCalories += calories;
                ingredientsList.push(`${name} (${quantity})`);
            }

            await addEntry({
                name: dishName,
                quantity: ingredientsList.join(", "),
                calories: totalCalories,
            });
            hideModal(detailsModalOverlay);
        } catch (e) {
            errorMessage.textContent = "Erreur lors de l'estimation.";
            errorMessage.classList.remove("hidden");
        } finally {
            submitFoodBtn.disabled = false;
            submitFoodBtnText.textContent = "Ajouter et estimer";
        }
    }
};

// Initialisation
window.onload = initializeApp;
