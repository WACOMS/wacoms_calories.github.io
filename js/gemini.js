export async function estimateCaloriesWithGemini(name, quantity) {
    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.classList.add("show");
    try {
        const prompt = `Estimez le nombre de calories pour ${quantity} de ${name}. Répondez uniquement avec le nombre de calories en chiffres. Si l'estimation n'est pas possible, répondez "0".`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        };
        const apiKey = "AIzaSyAIdlqoroI_XSay1skW1c3Vw_FcgAW5uts"; // Fourni par Canvas à l'exécution
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "0";
        const calories = parseInt(text.trim(), 10);
        return isNaN(calories) ? 0 : calories;
    } catch {
        return 0;
    } finally {
        loadingOverlay.classList.remove("show");
    }
}
