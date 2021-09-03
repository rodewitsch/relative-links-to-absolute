(async function () {
  let rules = await getRules();
  const isEnabled = await checkExtensionEnable();
  if(!isEnabled) return;
  const currentHostRules = rules.filter(
    (rule) => rule.host === location.origin
  );
  window.addEventListener('load', () => changeLinks(currentHostRules));
  const watchedAttributes = currentHostRules.map((item) => item.attribute);
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes") {
        if (watchedAttributes.includes(mutation.attributeName))
          changeLinks(currentHostRules);
      }
    }
  });
  observer.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  function changeLinks(rules) {
    rules.forEach((rule) => {
      document.querySelectorAll(rule.selector).forEach((item) => {
        const URL_INSTANCE = new URL(item[rule.attribute]);
        item[rule.attribute] = rule.value + URL_INSTANCE.pathname;
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

  async function checkExtensionEnable(){
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(["enable"], (items) => {
        if(items.enable) return resolve(true);
        return resolve(false);
      })
    })
  }
})();
