chrome.runtime.sendMessage({ localStorage: localStorage }, (response) => {
  console.log("echo'd", response);
  initializeUI(response);
});
