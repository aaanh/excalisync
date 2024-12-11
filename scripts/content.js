chrome.runtime.sendMessage({ localStorage: localStorage }, (response) => {});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);

  if (request.retrieved) {
    Object.keys(request.retrieved).forEach((key) => {
      localStorage.setItem(key, request.retrieved[key]);
    });
    return true;
  } else {
    sendResponse("Unable to set local storage");
    return false;
  }
});
