/* eslint-disable no-undef */
document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const OPTIONS_BUTTON = document.querySelector(".settings");
    const CHECKBOX = document.querySelector("#enable-rules");

    chrome.storage.sync.get(['enable'],
      (items) => CHECKBOX.checked = (items || {}).enable) || false;;

    CHECKBOX.onchange = (event) => {
      chrome.storage.sync.set(
        {
          enable: event.currentTarget.checked
        },
        () => { }
      );
    }

    OPTIONS_BUTTON.onclick = () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options.html"));
      }
    };
  },
  false
);