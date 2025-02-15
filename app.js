document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://sheetdb.io/api/v1/cg3gwaj5yfawg";
    
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const clearButton = document.getElementById("clearButton");
    const outputContainer = document.getElementById("output");
    const loadingScreen = document.getElementById("loadingScreen");

    let sheetData = [];

    // Fetch Data from Google Sheets (with offline caching)
    function fetchData() {
        loadingScreen.style.display = "flex";

        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                sheetData = data;
                localStorage.setItem("cachedData", JSON.stringify(data)); // Cache the data
                localStorage.setItem("lastUpdated", Date.now()); // Store last update time
                loadingScreen.style.display = "none";
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                let cachedData = localStorage.getItem("cachedData");
                if (cachedData) {
                    sheetData = JSON.parse(cachedData);
                    outputContainer.innerHTML = `<p style="color: orange;">Offline mode: Using cached data.</p>`;
                } else {
                    outputContainer.innerHTML = `<p style="color: red;">Error loading data. Please check your internet connection.</p>`;
                }
                loadingScreen.style.display = "none";
            });
    }

    // Call fetchData when the page loads
    fetchData();

    // Function to search data
    function searchData() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) {
            outputContainer.innerHTML = "<p>Please enter a search term.</p>";
            return;
        }

        const results = sheetData.filter(row =>
            Object.values(row).some(value => value.toLowerCase().includes(searchTerm))
        );

        if (results.length === 0) {
            outputContainer.innerHTML = "<p>No results found.</p>";
            return;
        }

        // Display Results
        outputContainer.innerHTML = `<h3 style="font-size: 1.5em;">Search Results:</h3>`;
        results.forEach(row => {
            let searchColumn = Object.keys(row).find(key => row[key].toLowerCase().includes(searchTerm));

            // Define column colors
            const columnColors = {
                "سۆرانی": "#c05510",
                "بادینی": "#f5c265",
                "هەورامی": "#c05510" // Updated هەورامی to #c05510
            };

            // Ensure the searched column appears first
            let sortedKeys = Object.keys(row).sort((a, b) => (a === searchColumn ? -1 : b === searchColumn ? 1 : 0));

            let columnsHTML = sortedKeys.map(key => {
                let headerColor = columnColors[key] || "#000"; // Default black if column name is unknown
                return `<p><strong style="color: ${headerColor};">${key}:</strong> <span style="color: black;">${row[key]}</span></p>`;
            }).join("");

            outputContainer.innerHTML += `
                <div style="padding: 15px; border: 1px solid #ccc; margin-bottom: 10px; background-color: #fff; border-radius: 8px;">
                    ${columnsHTML}
                </div>`;
        });
    }

    // Event Listeners
    searchButton.addEventListener("click", searchData);
    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        outputContainer.innerHTML = "";
    });

    // Periodically refresh data every 30 minutes if online
    setInterval(() => {
        if (navigator.onLine) fetchData();
    }, 30 * 60 * 1000);
});
