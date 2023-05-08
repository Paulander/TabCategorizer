document.addEventListener("DOMContentLoaded", function () {
  const categoriesElement = document.getElementById("categories");
  const expandCollapseAllButton = document.getElementById("expandCollapseAll");

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("userSettings")) || {
      categories: {},
      colorScheme: "default",
      defaultCollapseState: true,
    };
    return settings;
  }

  const settings = loadSettings();

  chrome.tabs.query({}, (tabs) => {
    loadDefaultCategories(categoriesElement, tabs, settings.defaultCollapseState);
    loadUserCategories(categoriesElement, tabs, settings.defaultCollapseState);
  });

  expandCollapseAllButton.addEventListener("click", function () {
    const allCollapsibleButtons = document.querySelectorAll(".collapsible");
    let shouldExpand = false;

    allCollapsibleButtons.forEach((button) => {
      if (!button.classList.contains("active")) {
        shouldExpand = true;
      }
    });

    allCollapsibleButtons.forEach((button) => {
      const tabsElement = button.nextElementSibling;
      if (shouldExpand) {
        button.classList.add("active");
        tabsElement.style.display = "block";
        button.textContent = "Hide Tabs";
      } else {
        button.classList.remove("active");
        tabsElement.style.display = "none";
        button.textContent = "Show Tabs";
      }
    });
  });
});

document.getElementById("settings-button").addEventListener("click", function () {
  chrome.tabs.create({ url: "settings.html" }, function (tab) {
    setTimeout(function () {
      chrome.tabs.executeScript(tab.id, { file: "settings.js" }, function () {
        chrome.tabs.sendMessage(tab.id, { method: "displaySettings" });
      });
    }, 100);
  });
});



function processCategories(categories, categoriesElement, openTabs, defaultCollapseState) {
  for (const categoryName in categories) {
    const tabsData = categories[categoryName];

    const tabs = openTabs.filter((tab) => {
      try {
        const domain = new URL(tab.url).hostname.toLowerCase();
        return tabsData.some((tabDataDomain) => {
          const lowerCaseTabDataDomain = tabDataDomain.toLowerCase();
          return (
            domain === lowerCaseTabDataDomain ||
            domain.endsWith("." + lowerCaseTabDataDomain)
          );
        });
      } catch (error) {
        console.error(`Invalid URL: ${tab.url}`);
        return false;
      }
    }).map((tab) => {
      return { url: tab.url, name: tab.title };
    });

    if (tabs.length > 0) {
      const categoryElement = createCategoryElement(categoryName, tabs, defaultCollapseState);
      categoriesElement.appendChild(categoryElement);
    }
  }
}




function createCategoryElement(categoryName, tabs, defaultCollapseState) {
  const categoryElement = document.createElement('div');
  categoryElement.className = 'category';

  const categoryTitle = document.createElement('h2');
  categoryTitle.textContent = categoryName;
  categoryTitle.className = 'category-title';
  categoryElement.appendChild(categoryTitle);

  const collapsibleButton = document.createElement('button');
  collapsibleButton.textContent = 'Show Tabs';
  collapsibleButton.className = 'collapsible';
  categoryElement.appendChild(collapsibleButton);

  const tabsElement = document.createElement('div');
  tabsElement.className = 'tabs content';

  const userSettings = JSON.parse(localStorage.getItem("userSettings")) || { categories: {}, defaultCollapseState: true };

  collapsibleButton.addEventListener('click', function () {
    this.classList.toggle('active');
    if (tabsElement.style.display === 'block') {
      tabsElement.style.display = 'none';
      collapsibleButton.textContent = 'Show Tabs';
    } else {
      tabsElement.style.display = 'block';
      collapsibleButton.textContent = 'Hide Tabs';
    }
  });

  if (userSettings.defaultCollapseState) {
    collapsibleButton.classList.remove('active');
    tabsElement.style.display = 'none';
    collapsibleButton.textContent = 'Show Tabs';
  } else {
    collapsibleButton.classList.add('active');
    tabsElement.style.display = 'block';
    collapsibleButton.textContent = 'Hide Tabs';
  }

  collapsibleButton.addEventListener('click', function () {
    this.classList.toggle('active');
    if (tabsElement.style.display === 'block') {
      tabsElement.style.display = 'none';
      collapsibleButton.textContent = 'Show Tabs';
    } else {
      tabsElement.style.display = 'block';
      collapsibleButton.textContent = 'Hide Tabs';
    }
  });

  if (defaultCollapseState) {
    collapsibleButton.classList.remove('active');
    tabsElement.style.display = 'none';
    collapsibleButton.textContent = 'Show Tabs';
  } else {
    collapsibleButton.classList.add('active');
    tabsElement.style.display = 'block';
    collapsibleButton.textContent = 'Hide Tabs';
  }

  if (userSettings.defaultCollapseState) {
    collapsibleButton.classList.remove('active');
    tabsElement.style.display = 'none';
    collapsibleButton.textContent = 'Show Tabs';
  } else {
    collapsibleButton.classList.add('active');
    tabsElement.style.display = 'block';
    collapsibleButton.textContent = 'Hide Tabs';
  }

  if (Array.isArray(tabs)) {
    tabs.forEach((tab) => {
      const tabElement = createTabElement(tab);
      tabsElement.appendChild(tabElement);
    });
  }

  categoryElement.appendChild(tabsElement);

  return categoryElement;
}

function createTabElement(tab) {
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

  return tabElement;
}



function loadDefaultCategories(categoriesElement, openTabs, defaultCollapseState) {
  fetch("categories.json")
    .then((response) => response.json())
    .then((data) => {
      const defaultCategories = data.reduce((acc, category) => {
        acc[category.category] = category.domains.map((domain) => domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""));
        return acc;
      }, {});
      processCategories(defaultCategories, categoriesElement, openTabs, defaultCollapseState);
      applyAlternatingBackgroundColors(categoriesElement);
    });
}





function loadUserCategories(categoriesElement, openTabs, defaultCollapseState) {
  const userSettings = JSON.parse(localStorage.getItem("userSettings")) || { categories: {} };
  const formattedCategories = {};

  for (const categoryName in userSettings.categories) {
    formattedCategories[categoryName] = userSettings.categories[categoryName].map((domain) => domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""));
  }

  processCategories(formattedCategories, categoriesElement, openTabs, defaultCollapseState);
  applyAlternatingBackgroundColors(categoriesElement);
}



function applyAlternatingBackgroundColors(categoriesElement) {
  const categories = categoriesElement.querySelectorAll('.category');
  categories.forEach((category, index) => {
    if (index % 2 === 0) {
      category.style.backgroundColor = '#f2f2f2';
    } else {
      category.style.backgroundColor = '#ffffff';
    }
  });
}
