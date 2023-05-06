document.addEventListener("DOMContentLoaded", function () {
  const categoriesList = document.getElementById("categories-list");
  const addCategoryButton = document.getElementById("add-category");
  const colorOptions = document.getElementById("color-options");

  // Load user settings
  function loadSettings() {
    // Retrieve user settings from local storage
    // If settings are not available, use default settings
    const settings = JSON.parse(localStorage.getItem("userSettings")) || {
      categories: {},
      colorScheme: "default",
    };

    // Populate categories list
    categoriesList.innerHTML = "";
    for (const [category, domains] of Object.entries(settings.categories)) {
      const categoryItem = document.createElement("div");
      categoryItem.textContent = category;
      categoriesList.appendChild(categoryItem);
    }

    // Set selected color scheme
    colorOptions.value = settings.colorScheme;
  }

  // Save user settings
  function saveSettings(settings) {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }

  // Add new category
  addCategoryButton.addEventListener("click", function () {
    const newCategory = prompt("Enter the name of the new category:");
    if (newCategory) {
      const settings = JSON.parse(localStorage.getItem("userSettings"));
      settings.categories[newCategory] = [];
      saveSettings(settings);
      loadSettings();
    }
  });

  // Change color scheme
  colorOptions.addEventListener("change", function () {
    const settings = JSON.parse(localStorage.getItem("userSettings"));
    settings.colorScheme = colorOptions.value;
    saveSettings(settings);
  });

  // Load settings when the page loads
  loadSettings();
});
