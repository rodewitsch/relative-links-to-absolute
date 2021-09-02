document.addEventListener('DOMContentLoaded', async () => {

  let rules = await loadRules();

  document.getElementById('add-rule').onclick = () => {
    addRule();
    render(0);
  }

  function render(activeNumber = null) {
    const settingsContent = document.getElementById('settings-content');
    settingsContent.innerHTML = '';
    rules.forEach((setting, settingsIndex) => {
      const settingButton = document.createElement('button');
      settingButton.classList.add('accordion');
      settingButton.innerHTML = `
        <strong>Host:</strong>
        <span>${setting.host}</span><br>
        <strong>Selector:</strong>
        <span>${setting.selector}</span><br>
        <strong>Value:</strong>
        <span>${setting.value}</span>
      `;

      const settingElem = document.createElement('div');
      settingElem.classList.add('panel');

      const ruleElem = document.createElement('div');
      ruleElem.classList.add('rule');
      ruleElem.innerHTML = `
          <label for="${settingsIndex}-host">Host</label>
          <input type="text" class="host" id="${settingsIndex}-host" value="${setting.host}">
          <label for="${settingsIndex}-selector">Selector</label>
          <input type="text" class="selector" id="${settingsIndex}-selector" value="${setting.selector}">
          <label for="${settingsIndex}-attribute">Attribute</label>
          <input type="text" class="attribute" id="${settingsIndex}-attribute" value="${setting.attribute}">
          <label for="${settingsIndex}-value">Value</label>
          <input type="text" class="value" id="${settingsIndex}-value" value="${setting.value}">
          <div class="actions">
            <button class="btn btn-green save">Save</button>
            <button class="btn btn-red remove" data-index="${settingsIndex}">Remove</button>
          </div>
        `;
      settingElem.appendChild(ruleElem);

      settingElem.querySelector('.actions .save').onclick = saveRules;

      settingElem.querySelector('.actions .remove').onclick = (event) => {
        removeRule(event);
        render();
        saveRules();
      }

      settingsContent.appendChild(settingButton);
      settingsContent.appendChild(settingElem);
    });

    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function () {
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
  }
  render();

  function addRule() {
    rules.unshift({
      host: '',
      selector: '',
      attribute: '',
      value: ''
    });
  }

  function removeRule(event) {
    const index = +event.currentTarget.dataset.index;
    rules.splice(index, 1);
  }

  function saveRules() {
    const rules = [];
    (document.querySelectorAll('.rule') || []).forEach(rule => {
      rules.push({
        host: rule.querySelector('.host').value,
        selector: rule.querySelector('.selector').value,
        attribute: rule.querySelector('.attribute').value,
        value: rule.querySelector('.value').value
      })
    });
    chrome.storage.sync.set(
      {
        rules: JSON.stringify(rules)
      },
      () => location.reload()
    );
  }

  async function loadRules() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['rules'],
        (items) => resolve(JSON.parse(items.rules)));
    })
  }

});

