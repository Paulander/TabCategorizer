document.addEventListener("DOMContentLoaded", function () {
  const categoriesList = document.getElementById("categories-list");
  const addCategoryButton = document.getElementById("add-category");
  const colorOptions = document.getElementById("color-options");
  const defaultCollapseStateCheckbox = document.getElementById("defaultCollapseState");

  // Load user settings
  function loadSettings() {
    // Retrieve user settings from local storage
    // If settings are not available, use default settings
    const settings = JSON.parse(localStorage.getItem("userSettings")) || {
      categories: {},
      colorScheme: "default",
      defaultCollapseState: true,
    };
    return settings;
  }

  // Save user settings
  function saveSettings(settings) {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }

  const clearUserCategoriesButton = document.getElementById("clear-user-categories");

  clearUserCategoriesButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all user categories?")) {
      const settings = JSON.parse(localStorage.getItem("userSettings"));
      settings.categories = {};
      saveSettings(settings);
      loadSettings();
    }
  });

// Update default collapse state
defaultCollapseStateCheckbox.addEventListener("change", function () {
  const settings = loadSettings();
  settings.defaultCollapseState = defaultCollapseStateCheckbox.checked;
  saveSettings(settings);
});




  function displaySettings(settings) {

    defaultCollapseStateCheckbox.checked = settings.defaultCollapseState;
    // Populate categories list
    categoriesList.innerHTML = "";
    for (const [category, domains] of Object.entries(settings.categories)) {
      const categoryContainer = document.createElement("div");
      categoryContainer.className = "category-container";

      const categoryName = document.createElement("div");
      categoryName.className = "category-name";
      categoryName.textContent = category;
      categoryContainer.appendChild(categoryName);

      const domainsList = document.createElement("ul");
      domainsList.className = "websites-list";
      for (const domain of domains) {
        const domainItem = document.createElement("li");
        domainItem.className = "website-item";
        domainItem.textContent = domain;
        domainsList.appendChild(domainItem);
      }
      categoryContainer.appendChild(domainsList);
      categoriesList.appendChild(categoryContainer);
    }

    // Set selected color scheme
    colorOptions.value = settings.colorScheme;

    // Set the default collapse state
    defaultCollapseStateCheckbox.checked = settings.defaultCollapseState;

    // Populate category dropdown
    const categorySelect = document.getElementById("category-select");
    categorySelect.innerHTML = "";
    for (const category in settings.categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    }
  }

  // Add new category
  addCategoryButton.addEventListener("click", function () {
    const newCategory = prompt("Enter the name of the new category:");
    if (newCategory) {
      const settings = loadSettings();
      settings.categories[newCategory] = [];
      saveSettings(settings);
      displaySettings(settings);
    }
  });

  // Change color scheme
  colorOptions.addEventListener("change", function () {
    const settings = loadSettings();
    settings.colorScheme = colorOptions.value;
    saveSettings(settings);
  });

  // Add website to category
  document.getElementById("add-website-button").addEventListener("click", function () {
    const categorySelect = document.getElementById("category-select");
    const websiteInput = document.getElementById("website-input");

    const selectedCategory = categorySelect.value;
    const websiteURL = websiteInput.value.trim();

    if (selectedCategory && websiteURL) {
      const settings = loadSettings();
      if (!settings.categories[selectedCategory].includes(websiteURL)) {
        settings.categories[selectedCategory].push(websiteURL);
        saveSettings(settings);
        displaySettings(settings);
        websiteInput.value = "";
        alert("Website added successfully!");
      } else {
        alert("This website is already in the selected category.");
      }
    }
  });
});
