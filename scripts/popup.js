console.log(github_pat);

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
  chrome.runtime.sendMessage({ github_pat: github_pat }, (response) => {});
});

document.getElementById("download_data").addEventListener("click", () => {
  const github_pat = document.getElementById("github_pat").value;
  chrome.runtime.sendMessage({ github_pat: github_pat, download: true });
});
