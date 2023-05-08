document.addEventListener('DOMContentLoaded', function () {
  const categoriesElement = document.getElementById("categories");

  chrome.tabs.query({}, (tabs) => {
    loadDefaultCategories(categoriesElement, tabs);
    loadUserCategories(categoriesElement, tabs);
  });
});


function processCategories(categories, categoriesElement, openTabs) {
  for (const categoryName in categories) {
    const tabsData = categories[categoryName];

    console.log(`Processing category: ${categoryName}`); // Debug line

    const tabs = openTabs.filter((tab) => {
      try {
        const domain = new URL(tab.url).hostname.replace(/^www\./, '');
        const isMatch = tabsData.some(tabDomain => domain === tabDomain || `www.${domain}` === tabDomain);
        console.log(`Tab domain: ${domain}, isMatch: ${isMatch}`); // Debug line
        return isMatch;
      } catch (error) {
        console.error(`Invalid URL: ${tab.url}`);
        return false;
      }
    }).map((tab) => {
      return { url: tab.url, name: tab.title };
    });

    if (tabs.length > 0) {
      const categoryElement = createCategoryElement(categoryName, tabs);
      categoriesElement.appendChild(categoryElement);
    }
  }
}



function createCategoryElement(categoryName, tabs) {
  const categoryElement = document.createElement('div');
  categoryElement.className = 'category';

  const categoryTitle = document.createElement('h2');
  categoryTitle.textContent = categoryName;
  categoryTitle.className = 'category-title';
  categoryElement.appendChild(categoryTitle);

  const tabsElement = document.createElement('div');
  tabsElement.className = 'tabs';

  if (Array.isArray(tabs)) {
    tabs.forEach((tab) => {
      const tabElement = document.createElement("div");
      tabElement.className = "tab";

      const favicon = document.createElement('img');
      favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`;
      favicon.width = 16;
      favicon.height = 16;
      tabElement.appendChild(favicon);

      const tabTitle = document.createElement('span');
      tabTitle.textContent = tab.name;
      tabTitle.className = 'tab-title';
      tabElement.appendChild(tabTitle);

      tabElement.addEventListener("click", function () {
        chrome.tabs.create({ url: tab.url });
      });

      tabsElement.appendChild(tabElement);
    });
  }

  categoryElement.appendChild(tabsElement);

  return categoryElement;
}


function loadDefaultCategories(categoriesElement, openTabs) {
  fetch("categories.json")
    .then((response) => response.json())
    .then((data) => {
      const defaultCategories = data.reduce((acc, category) => {
        acc[category.category] = category.domains.map((domain) => domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""));
        return acc;
      }, {});
      processCategories(defaultCategories, categoriesElement, openTabs);
    });
}

function loadUserCategories(categoriesElement, openTabs) {
  const userSettings = JSON.parse(localStorage.getItem("userSettings")) || { categories: {} };
  const formattedCategories = {};

  for (const categoryName in userSettings.categories) {
    formattedCategories[categoryName] = userSettings.categories[categoryName].map((domain) => domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""));
  }

  processCategories(formattedCategories, categoriesElement, openTabs);
}


