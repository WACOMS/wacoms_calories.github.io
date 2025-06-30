export let dailyEntries = [];

const totalCaloriesDisplay = document.getElementById("totalCaloriesDisplay");
const foodListContainer = document.getElementById("foodListContainer");
const noItemsMessage = document.getElementById("noItemsMessage");
const MAX_CALORIES = 1300;

function saveToLocalStorage() {
    localStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('dailyEntries');
    if (stored) {
        dailyEntries.splice(0, dailyEntries.length, ...JSON.parse(stored));
    }
}

export function renderFoodList() {
    foodListContainer.innerHTML = "";
    let total = 0;
    if (dailyEntries.length === 0) {
        noItemsMessage.classList.remove("hidden");
    } else {
        noItemsMessage.classList.add("hidden");
        dailyEntries.forEach((entry) => {
            total += entry.calories;
            const div = document.createElement("div");
            div.className = "food-item";
            div.innerHTML = `
                <div>
                    <div class="food-name">${entry.name}</div>
                    <div class="food-details">${entry.quantity}</div>
                </div>
                <div class="food-calories">${entry.calories} kcal</div>
            `;
            foodListContainer.appendChild(div);
        });
    }
    totalCaloriesDisplay.textContent = `${total} / ${MAX_CALORIES}`;
    totalCaloriesDisplay.classList.toggle("text-red-500", total > MAX_CALORIES);
    totalCaloriesDisplay.classList.toggle("text-white", total <= MAX_CALORIES);
}

export async function addEntry(entry) {
    dailyEntries.push(entry);
    saveToLocalStorage();
    renderFoodList();
}

export function initializeApp() {
    loadFromLocalStorage();
    renderFoodList();
}