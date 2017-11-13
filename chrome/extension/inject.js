
window.onload = () => {
  const selectEle = document.querySelector("select[name=billingcycle]");
  const optionELe = selectEle.querySelector("option[value=annually]");
  if (!!selectEle && !!optionELe) {
    if (optionELe.selected == "selected") {
      const submitEle = document.querySelector("input[type=submit]");
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
}

