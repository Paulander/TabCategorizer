document.addEventListener("DOMContentLoaded", () => {
  const categoriesList = document.getElementById("categories-list");
  const addCategoryButton = document.getElementById("add-category");
  const colorOptions = document.getElementById("color-options");
  const defaultCollapseStateCheckbox = document.getElementById("defaultCollapseState");

  const settings = loadSettings();
  displaySettings(settings);

  addCategoryButton.addEventListener("click", addCategory);
  colorOptions.addEventListener("change", changeColorScheme);
  defaultCollapseStateCheckbox.addEventListener("change", updateDefaultCollapseState);
  document.getElementById("add-website-button").addEventListener("click", addWebsite);
  document.getElementById("clear-user-categories").addEventListener("click", clearUserCategories);
});

function loadSettings() {
  return JSON.parse(localStorage.getItem("userSettings")) || {
    categories: {},
    colorScheme: "default",
    defaultCollapseState: true,
  };
}

function saveSettings(settings) {
  localStorage.setItem("userSettings", JSON.stringify(settings));
}

function addCategory() {
  const newCategory = prompt("Enter the name of the new category:");
  if (newCategory) {
    const settings = loadSettings();
    settings.categories[newCategory] = [];
    saveSettings(settings);
    displaySettings(settings);
  }
}

function changeColorScheme() {
  const settings = loadSettings();
  settings.colorScheme = this.value;
  saveSettings(settings);
}

function updateDefaultCollapseState() {
  const settings = loadSettings();
  settings.defaultCollapseState = this.checked;
  saveSettings(settings);
}

function addWebsite() {
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
}

function clearUserCategories() {
  if (confirm("Are you sure you want to clear all user categories?")) {
    const settings = loadSettings();
    settings.categories = {};
    saveSettings(settings);
    displaySettings(settings);
  }
}


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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "displaySettings") {
    displaySettings(loadSettings());
  }
});

window.displaySettings = displaySettings;