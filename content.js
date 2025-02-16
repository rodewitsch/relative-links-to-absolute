(async function () {
  let rules = await getRules();
  const isEnabled = await checkExtensionEnable();
  if (!isEnabled) return;
  const currentHostRules = rules.filter(
    (rule) => rule.host === location.origin
  );

  if (currentHostRules.length === 0) return;

  changeLinks(currentHostRules);

  window.addEventListener('load', () => changeLinks(currentHostRules));
  const observer = new MutationObserver((mutationsList) => {
    observer.disconnect();

    if (mutationsList.some(mutation => ['attributes', 'childList'].includes(mutation.type))) {
      changeLinks(currentHostRules);
    }

    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });

  observer.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  function changeLinks(rules) {
    rules.forEach((rule) => {
      document.querySelectorAll(rule.selector).forEach((item) => {
        if (['src', 'href'].includes(rule.attribute) && item[rule.attribute] && !item[rule.attribute].includes(rule.value)) {
          const URL_INSTANCE = new URL(item[rule.attribute]);
          item[rule.attribute] = rule.value + URL_INSTANCE.pathname;
        }
        if (rule.attribute === 'background-image') {
          if (rule.attribute === 'background-image' && item.style[rule.attribute] && !item.style[rule.attribute].includes(rule.value)) {
            item.style[rule.attribute] = `url("${rule.value + item.style[rule.attribute].slice(5)}`;
          }
        }
      });
    });
  }

  async function getRules() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(["rules"], (items) => {
        if (items.rules) return resolve(JSON.parse(items.rules));
        return resolve([]);
      });
    });
  }

  async function checkExtensionEnable() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(["enable"], (items) => {
        if (items.enable) return resolve(true);
        return resolve(false);
      })
    })
  }
})();
