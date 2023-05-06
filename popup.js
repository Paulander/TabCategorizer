document.addEventListener('DOMContentLoaded', async function () {
  async function categorizeTabs() {
    const response = await fetch(chrome.runtime.getURL("categories.json"));
    const categoriesData = await response.json();

    const categories = categoriesData.reduce((obj, item) => {
      obj[item.category] = item.domains;
      return obj;
    }, {});

    // As of Manifest V3, the callback-based chrome.tabs.query is replaced with a Promise-based function
    chrome.tabs.query({}).then((tabs) => {
      const categorizedTabs = {};

      for (const tab of tabs) {
        for (const [category, domains] of Object.entries(categories)) {
          for (const domain of domains) {
            if (tab.url.toLowerCase().includes(domain.toLowerCase())) {
              if (!categorizedTabs[category]) {
                categorizedTabs[category] = [];
              }
              categorizedTabs[category].push(tab);
              break;
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
  }

  await categorizeTabs();
});
