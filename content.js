window.onload = function () {

  chrome.storage.sync.get(['rules'],
    (items) => {
      const rules = JSON.parse(items.rules);
      const currentHostRules = rules.filter(rule => rule.host === location.origin);
      currentHostRules.forEach(rule => {
        document.querySelectorAll(rule.selector).forEach(item => {
          const URL_INSTANCE = new URL(item[rule.attribute]);
          item[rule.attribute] = rule.value + URL_INSTANCE.pathname;
        })
      })
    });
}