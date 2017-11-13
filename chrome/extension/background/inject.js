const arrowURLs = ['^https://bwh1\\.net'];
const goodsUrl = "https://bwh1.net/cart.php?a=add&pid=43";
const UrlRegExp = {
  goods: /https:\/\/bwh1\.net\/cart\.php\?a\=add&pid\=43/,
  view: /https:\/\/bwh1\.net\/cart\.php\?a\=view/,
  checkout: /https:\/\/bwh1\.net\/cart\.php\?a\=checkout/
};

function isInjected(tabId) {
  return chrome.tabs.executeScriptAsync(tabId, {
    code: `var injected = window.reactExampleInjected;
      window.reactExampleInjected = true;
      injected;`,
    runAt: 'document_start'
  });
}

function loadScript(name, tabId, cb) {
  if (process.env.NODE_ENV === 'production') {
    chrome.tabs.executeScript(tabId, { file: `/js/${name}.bundle.js`, runAt: 'document_end' }, cb);
  } else {
    // dev: async fetch bundle
    fetch(`http://localhost:3000/js/${name}.bundle.js`)
    .then(res => res.text())
    .then((fetchRes) => {
      // Load redux-devtools-extension inject bundle,
      // because inject script and page is in a different context
      const request = new XMLHttpRequest();
      request.open('GET', 'chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/js/redux-devtools-extension.js');  // sync
      request.send();
      request.onload = () => {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
          chrome.tabs.executeScript(tabId, { code: request.responseText, runAt: 'document_start' });
        }
      };
      chrome.tabs.executeScript(tabId, { code: fetchRes, runAt: 'document_end' }, cb);
    });
  }
}


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'loading' || !tab.url.match(arrowURLs.join('|'))) return;
  const result = await isInjected(tabId);
  if (chrome.runtime.lastError || result[0]) return;
  if (UrlRegExp.goods.test(tab.url)) {
    chrome.tabs.executeScript(tabId, {code: `
          var selectEle = document.querySelector("select[name=billingcycle]");
          var optionELe = document.querySelector("option[value=annually]");
          var currentUrl = location.href;
          if (!!selectEle && !!optionELe) {
            if (optionELe.selected == "selected") {
              var submitEle = document.querySelector("input[type=submit]");
              submitEle.click();
            }
            else {
              optionELe.selected = "selected";
              let e = document.createEvent("Event");
              e.initEvent("change", true, true);
              selectEle.dispatchEvent(e);
            }
          }
          else {
            window.location.href = currentUrl
          }
    `, runAt: 'document_end'}, () => { console.log("load success") });
  }
  else if (UrlRegExp.checkout.test(tab.url)) {
    chrome.tabs.executeScript(tabId, {code: `
      var currentUrl = location.href;
      var alipayEle = document.querySelector("input[value=newalipay]");
      var accepttosEle = document.querySelector("input[name=accepttos]");
      var submitELe = document.querySelector("input[type=submit]");
      if (!!alipayEle && !!accepttosEle) {
        alipayEle.click();
        accepttosEle.click();
        submitELe.click();
      }
      else {
        window.location.href = currentUrl;
      }
      
    `, runAt: 'document_end'}, () => { console.log("load success") });
  }
  else if (UrlRegExp.view.test(tab.url)) {
    chrome.tabs.executeScript(tabId, {code: `
      var currentUrl = location.href;    
      var code = "BWH1ZBPVK";
      var inputEle = document.querySelector("input[name=promocode]");
      var validateEle = document.querySelector("input[type=submit]");
      var checkoutEle = document.querySelector("input[value=Checkout]");
      if (!!inputEle && !!validateEle) {
        inputEle.value = code;
        validateEle.click();
      }
      else {
        !!checkoutEle && checkoutEle.click();
      }
      
    `, runAt: 'document_end'}, () => { console.log("load success") });
  }
});
