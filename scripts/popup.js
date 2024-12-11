document.addEventListener("DOMContentLoaded", () => {
  const githubPatInput = document.getElementById("github_pat");

  chrome.runtime.onMessage.addListener((message) => {
    if (message.github_pat) {
      githubPatInput.value = message.github_pat; // Populate input field
    }
  });

  // Optionally, trigger fetch of existing `github_pat`
  chrome.runtime.sendMessage({ request_github_pat: true });
});

document.getElementById("send_data").addEventListener("click", () => {
  const github_pat = document.getElementById("github_pat").value;
  chrome.runtime.sendMessage(
    { github_pat: github_pat, upload: true },
    (response) => {}
  );
});

document.getElementById("download_data").addEventListener("click", () => {
  const github_pat = document.getElementById("github_pat").value;
  chrome.runtime.sendMessage(
    { github_pat: github_pat, download: true },
    (res) => {
      console.log(res);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, res, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
            } else {
              console.log("Response from content script:", response);
            }
          });
        } else {
          console.log("No active tab found.");
        }
      });
    }
  );
});
