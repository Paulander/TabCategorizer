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

function populateCategoryDropdown() {
  const categorySelect = document.getElementById("category-select");
  categorySelect.innerHTML = "";

  for (const category in settings.categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  }
}

populateCategoryDropdown();

document.getElementById("add-website-button").addEventListener("click", function () {
  const categorySelect = document.getElementById("category-select");
  const websiteInput = document.getElementById("website-input");

  const selectedCategory = categorySelect.value;
  const websiteURL = websiteInput.value.trim();

  if (selectedCategory && websiteURL) {
    if (!settings.categories[selectedCategory].includes(websiteURL)) {
      settings.categories[selectedCategory].push(websiteURL);
      localStorage.setItem("settings.categories", JSON.stringify(settings.categories));
      websiteInput.value = "";
      alert("Website added successfully!");
    } else {
      alert("This website is already in the selected category.");
    }
  } else {
    alert("Please select a category and enter a website URL.");
  }
});
