document.addEventListener('DOMContentLoaded', function () {
  loadCategories();
});

function loadCategories() {
  const categoriesElement = document.getElementById('categories');

  // Load default categories
  fetch('categories.json')
    .then(response => response.json())
    .then(data => {
      for (const categoryName in data) {
        const categoryElement = createCategoryElement(categoryName, data[categoryName]);
        categoriesElement.appendChild(categoryElement);
      }
    });

  // Load user categories
  const userSettings = JSON.parse(localStorage.getItem('userSettings')) || { categories: {} };
  for (const categoryName in userSettings.categories) {
    const categoryElement = createCategoryElement(categoryName, userSettings.categories[categoryName]);
    categoriesElement.appendChild(categoryElement);
  }
}

function createCategoryElement(categoryName, tabs) {
  const categoryElement = document.createElement('div');
  categoryElement.className = 'category';

  const categoryTitle = document.createElement('h2');
  categoryTitle.textContent = categoryName;
  categoryElement.appendChild(categoryTitle);

  const tabsElement = document.createElement('div');
  tabsElement.className = 'tabs';

  if (Array.isArray(tabs)) {
    tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = 'tab';
      tabElement.textContent = tab.name;
      tabsElement.appendChild(tabElement);
    });
  }

  categoryElement.appendChild(tabsElement);

  return categoryElement;
}

