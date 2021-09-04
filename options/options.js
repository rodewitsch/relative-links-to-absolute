document.addEventListener("DOMContentLoaded", async () => {
  let rules = await loadRules();

  document.getElementById("add-rule").onclick = () => {
    addRule();
    render(0);
  };

  function render(activeNumber = null) {
    const settingsContent = document.getElementById("settings-content");
    settingsContent.innerHTML = "";

    if (rules && rules.length) {
      rules.forEach((setting, settingsIndex) => {
        const settingButton = document.createElement("button");
        settingButton.classList.add("accordion");
        settingButton.innerHTML = `
        <strong>Host:</strong>
        <span>${setting.host}</span><br>
        <strong>Selector:</strong>
        <span>${setting.selector}</span><br>
        <strong>Value:</strong>
        <span>${setting.value}</span>
      `;

        const settingElem = document.createElement("div");
        settingElem.classList.add("panel");

        const ruleElem = document.createElement("div");
        ruleElem.classList.add("rule");
        ruleElem.innerHTML = `
          <label for="${settingsIndex}-host">Host*</label>
          <input type="text" class="host" id="${settingsIndex}-host" value="${setting.host}" placeholder="Example: http://localhost:3000" required="required">
          <label for="${settingsIndex}-selector">Selector*</label>
          <input type="text" class="selector" id="${settingsIndex}-selector" value="${setting.selector}" placeholder="Example: img[src^='/page']" required="required">
          <label for="${settingsIndex}-attribute">Attribute*</label>
          <input type="text" class="attribute" id="${settingsIndex}-attribute" value="${setting.attribute}" placeholder="Example: src" required="required">
          <label for="${settingsIndex}-value">Value*</label>
          <input type="text" class="value" id="${settingsIndex}-value" value="${setting.value}" placeholder="Example: http://192.168.1.2:4000" required="required">
          <div class="actions">
            <button class="btn btn-green save">Save</button>
            <button class="btn btn-red remove" data-index="${settingsIndex}">Remove</button>
          </div>
        `;
        settingElem.appendChild(ruleElem);

        settingElem.querySelector(".actions .save").onclick = saveRules;

        settingElem.querySelector(".actions .remove").onclick = (event) => {
          removeRule(event);
          render();
          saveRules();
        };

        settingsContent.appendChild(settingButton);
        settingsContent.appendChild(settingElem);
      });

      const acc = document.getElementsByClassName("accordion");
      for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function (event) {
          if (activeNumber === null && checkUnsavedRules()) return;
          const activeAccordion = document.querySelector(".accordion.active");
          if (
            activeAccordion &&
            !activeAccordion.isSameNode(event.currentTarget)
          ) {
            checkUnsavedRules();
            return;
          }
          if (
            activeAccordion &&
            activeAccordion.isSameNode(event.currentTarget)
          ) {
            const inputs = this.nextElementSibling.querySelectorAll("input");
            if (Array.from(inputs).some((input) => !input.value)) {
              checkUnsavedRules();
              return;
            }
          }
          this.classList.toggle("active");
          const panel = this.nextElementSibling;
          if (panel.style.display === "block") {
            panel.style.display = "none";
          } else {
            panel.style.display = "block";
          }
        });
      }

      if (activeNumber !== null) acc[activeNumber].click();
    } else {
      const noRules = document.createElement("div");
      noRules.classList.add("no-rules");
      noRules.innerHTML = `
        <span>There are no replacement rules.</span>
      `;
      settingsContent.appendChild(noRules);
    }
  }
  render();

  function addRule() {
    if (checkUnsavedRules()) throw new Error("There are unsaved rules");
    rules.unshift({
      host: "",
      selector: "",
      attribute: "",
      value: "",
    });
  }

  function removeRule(event) {
    const index = +event.currentTarget.dataset.index;
    rules.splice(index, 1);
  }

  function checkUnsavedRules() {
    let invalid = false;
    (document.querySelectorAll(".rule") || []).forEach((rule) => {
      const hostElem = rule.querySelector(".host");
      const selectorElem = rule.querySelector(".selector");
      const attributeElem = rule.querySelector(".attribute");
      const valueElem = rule.querySelector(".value");
      hostElem.classList[hostElem.value ? "remove" : "add"]("invalid");
      selectorElem.classList[selectorElem.value ? "remove" : "add"]("invalid");
      hostElem.classList[hostElem.value ? "remove" : "add"]("invalid");
      attributeElem.classList[attributeElem.value ? "remove" : "add"](
        "invalid"
      );
      valueElem.classList[valueElem.value ? "remove" : "add"]("invalid");
      if (
        !hostElem.value ||
        !selectorElem.value ||
        !attributeElem.value ||
        !valueElem.value
      ) {
        invalid = true;
      }
    });
    return invalid;
  }

  function saveRules() {
    const rules = [];
    let invalid = false;
    (document.querySelectorAll(".rule") || []).forEach((rule) => {
      const hostElem = rule.querySelector(".host");
      const selectorElem = rule.querySelector(".selector");
      const attributeElem = rule.querySelector(".attribute");
      const valueElem = rule.querySelector(".value");
      hostElem.classList[hostElem.value ? "remove" : "add"]("invalid");
      selectorElem.classList[selectorElem.value ? "remove" : "add"]("invalid");
      hostElem.classList[hostElem.value ? "remove" : "add"]("invalid");
      attributeElem.classList[attributeElem.value ? "remove" : "add"](
        "invalid"
      );
      valueElem.classList[valueElem.value ? "remove" : "add"]("invalid");
      if (
        !hostElem.value ||
        !selectorElem.value ||
        !attributeElem.value ||
        !valueElem.value
      ) {
        invalid = true;
        return;
      }
      rules.push({
        host: hostElem.value,
        selector: selectorElem.value,
        attribute: attributeElem.value,
        value: valueElem.value,
      });
    });
    if (invalid) return;
    chrome.storage.sync.set(
      {
        rules: JSON.stringify(rules),
      },
      () => location.reload()
    );
  }

  async function loadRules() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(["rules"], (items) => {
        if (items.rules) return resolve(JSON.parse(items.rules));
        return resolve([]);
      });
    });
  }
});
