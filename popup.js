document.addEventListener('DOMContentLoaded', function () {
  const categories = {
    "Social Media": ["facebook.com", "twitter.com"],
    "News": ["cnn.com", "bbc.com"],
    "Shopping": ["amazon.com", "ebay.com"],
  };

  // As of Manifest V3, the callback-based chrome.tabs.query is replaced with a Promise-based function
  chrome.tabs.query({}).then((tabs) => {
    const categorizedTabs = {};

    for (const tab of tabs) {
      for (const [category, domains] of Object.entries(categories)) {
        for (const domain of domains) {
          if (tab.url.includes(domain)) {
            if (!categorizedTabs[category]) {
              categorizedTabs[category] = [];
            }
            categorizedTabs[category].push(tab);
          }
        }
      }
    }

    const categoriesDiv = document.getElementById('categories');

    for (const [category, tabs] of Object.entries(categorizedTabs)) {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category';

      const categoryTitle = document.createElement('h2');
      categoryTitle.textContent = category;
      categoryDiv.appendChild(categoryTitle);

      const tabsDiv = document.createElement('div');
      tabsDiv.className = 'tabs';
      categoryDiv.appendChild(tabsDiv);

      for (const tab of tabs) {
        const tabDiv = document.createElement('div');
        tabDiv.className = 'tab';
        tabDiv.textContent = tab.title;
        tabDiv.addEventListener('click', function () {
          chrome.tabs.update(tab.id, { active: true });
        });
        tabsDiv.appendChild(tabDiv);
      }

      categoriesDiv.appendChild(categoryDiv);
    }
  });
});
