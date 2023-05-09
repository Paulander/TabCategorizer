document.addEventListener("DOMContentLoaded", function () {
  const categoriesElement = document.getElementById("categories");
  const expandCollapseAllButton = document.getElementById("expandCollapseAll");
  let isExpanded = false;

  const settings = loadSettings();

  chrome.tabs.query({}, (tabs) => {
    loadCategories(categoriesElement, tabs, settings.defaultCollapseState);
  });

  expandCollapseAllButton.addEventListener("click", expandOrCollapseAll);
});



const tabPreviews = {};
let tabsToCapture;

chrome.tabs.query({}, (tabs) => {
  tabsToCapture = tabs;
  captureTab();
});



function captureTab() {
  if (tabsToCapture.length === 0) {
    return;
  }
    const tab = tabsToCapture.shift();

  chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, (dataUrl) => {
    tabPreviews[tab.id] = dataUrl;
    setTimeout(captureTab, 1000);
  });
}


function showTabPreview(tabId) {
  // Try to get the preview from the tabPreviews object
  const preview = tabPreviews[tabId];

  const previewElement = document.getElementById("preview-image");

  if (preview) {
    // If the preview exists, show it
    previewElement.src = preview;
    previewElement.parentElement.style.display = "block";
  } 
  //This floods the api calls and El Goog gets enraged.
  /*else {
    // If the preview doesn't exist, capture it
    chrome.tabs.get(tabId, (tab) => {
      chrome.tabs.captureVisibleTab(tab.windowId, {format: "png"}, (dataUrl) => {
        tabPreviews[tabId] = dataUrl;
        // Once the preview is captured, show it
        previewElement.src = dataUrl;
        previewElement.parentElement.style.display = "block";
      });
    });
  }*/
}



function loadSettings() {
  const settings = JSON.parse(localStorage.getItem("userSettings")) || {
    categories: {},
    colorScheme: "default",
    defaultCollapseState: true,
  };
  return settings;
}

function loadCategories(categoriesElement, tabs, defaultCollapseState) {
  loadDefaultCategories(categoriesElement, tabs, defaultCollapseState);
  loadUserCategories(categoriesElement, tabs, defaultCollapseState);
}

function expandOrCollapseAll() {
  const allCategoryTitles = Array.from(document.querySelectorAll(".category-title"));
  const shouldExpand = allCategoryTitles.some(title => title.textContent.includes("+"));

  allCategoryTitles.forEach((title) => {
    const tabsElement = title.nextElementSibling;
    const categoryName = title.textContent.slice(0, -2);
    title.textContent = categoryName + (shouldExpand ? " -" : " +");
    tabsElement.style.display = shouldExpand ? "block" : "none";
  });

  // Update isExpanded flag based on the new state
  isExpanded = shouldExpand;
}


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
      return { url: tab.url, name: tab.title, id: tab.id };
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

  const tabsElement = document.createElement('div');
  tabsElement.className = 'tabs content';

  const userSettings = JSON.parse(localStorage.getItem("userSettings")) || { categories: {}, defaultCollapseState: true };


    //Hover effect for categories to display +/- for expand/collapse.
    categoryTitle.addEventListener('click', function () {
      const isCollapsed = tabsElement.style.display === 'none';
      if (isCollapsed) {
        tabsElement.style.display = 'block';
      } else {
        tabsElement.style.display = 'none';
      }
    });

    categoryTitle.addEventListener('mouseover', function () {
      const isCollapsed = tabsElement.style.display === 'none';
      if (isCollapsed) {
        categoryTitle.textContent = categoryName + " +";
      } else {
        categoryTitle.textContent = categoryName + " -";
      }
    });

    categoryTitle.addEventListener('mouseout', function () {
      categoryTitle.textContent = categoryName;
    });


 
  if (defaultCollapseState) {
    tabsElement.style.display = 'none';
  } else {
    tabsElement.style.display = 'block';
  }

  if (userSettings.defaultCollapseState) {
    tabsElement.style.display = 'none';
  } else {
    tabsElement.style.display = 'block';
  }

  if (Array.isArray(tabs)) {
    tabs.forEach((tabData) => {

    const tabElement = createTabElement(tabData, tabData.id);
    tabsElement.appendChild(tabElement);
    });
  }

  categoryElement.appendChild(tabsElement);

  return categoryElement;
}

function createTabElement(tab, tabId) {
  const tabElement = document.createElement("div");
  tabElement.className = "tab";
  tabElement.classList.add("tab");


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
    chrome.tabs.update(tabId, { active: true });
  });

   // Add event listener to show preview on hover
  tabElement.addEventListener("mouseover", () => {
    showTabPreview(tabId);
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method === "updateDefaultCollapseState") {
    isExpanded = !request.data;
    expandOrCollapseAll();
  }
});
