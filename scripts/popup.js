console.log(github_pat);

document.getElementById("send_data").addEventListener("click", () => {
  const github_pat = document.getElementById("github_pat").value;
  chrome.runtime.sendMessage({ github_pat: github_pat }, (response) => {});
});
