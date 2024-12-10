const GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";

let data = {
  github_pat: "",
  localStorage: undefined,
};

const repository = "excalisync-data";

async function getAuthenticatedUser(headers) {
  const res = await fetch(`${GITHUB_API_URL}/user`, {
    headers: headers,
  });

  const user = await res.json();

  console.log(user);

  return user;
}

async function isExistRepository(headers) {
  // Check user
  const user = await getAuthenticatedUser(headers);

  if (user.login) {
    // Check repo
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${user.login}/${repository}`,
      {
        headers: headers,
      }
    );

    const data = await res.json();

    if (data.id) {
      return { user: user, status: true };
    } else {
      return { user: user, status: false };
    }
  } else {
    console.log("Github PAT is invalid.");
    return false;
  }
}

async function createRepository(headers) {
  const res = await fetch(`${GITHUB_API_URL}/user/repos`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      name: repository,
      description:
        "Automatically created by ExcaliSync to save Excalidraw data",
      private: true,
      is_template: false,
    }),
  });

  const parsed = await res.json();

  console.log(parsed);

  switch (res.status) {
    case 201:
      console.log("Created repository");
      return true;
    case 400:
      console.error("Bad request, check request body");
      return false;
    case 403:
    case 401:
      console.error("Authentication failed, check PAT scope");
      return false;
    default:
      console.error("Unexpected error");
      return false;
  }
}

async function getFile(headers, user, repository) {
  const res = await fetch(
    `${GITHUB_API_URL}/repos/${user.login}/${repository}/contents/data.json`,
    {
      headers: headers,
    }
  );

  const parsed = await res.json();

  return parsed;
}

async function uploadData(headers, data) {
  console.log(data);

  const commit_message = `Synced at ${new Date().toISOString()}`;
  const committer = {
    name: data.user.name,
    email: data.user.email,
  };
  const content = data.payload;

  if (data.sha) {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${data.user.login}/${repository}/contents/data.json`,
      {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({
          message: commit_message,
          committer: committer,
          sha: data.sha,
          // Replace the escaped quotes with normal quotes
          // Github API requires conversion to base64 for content
          content: btoa(JSON.stringify(content)),
        }),
      }
    );
    const parsed = await res.json();
    console.log("Parsed response, file update", parsed);

    return parsed;
  } else {
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${data.user.login}/${repository}/contents/data.json`,
      {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({
          message: commit_message,
          committer: committer,
          // Replace the escaped quotes with normal quotes
          // Github API requires conversion to base64 for content
          content: btoa(JSON.stringify(content)),
        }),
      }
    );
    const parsed = await res.json();
    console.log("Parsed response, file update", parsed);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.localStorage) {
    data.localStorage = message.localStorage;
  }

  if (message.github_pat) {
    data.github_pat = message.github_pat;
    chrome.storage.local.set({ github_pat: message.github_pat }, () => {
      // Notify popup.html that github_pat has been updated
      chrome.runtime.sendMessage({ github_pat: message.github_pat });
    });
  } else {
    chrome.storage.local.get(["github_pat"]).then((res) => {
      data.github_pat = res.github_pat;
      // Notify popup.html that github_pat is available
      chrome.runtime.sendMessage({ github_pat: res.github_pat });
    });
  }

  const headers = new Headers({
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${data.github_pat}`,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  });

  if (message.download && data.github_pat.length > 0) {
    console.log("Download data triggered");
    isExistRepository(headers).then((res) => {
      const user = res.user;
      if (res.status) {
        getFile(headers, user, repository).then((file) => {
          const content = file.content;
          console.log("File retrieved", atob(content));
        });
      }
    });
  }

  if (data.github_pat.length > 0 && data.localStorage) {
    isExistRepository(headers).then((res) => {
      console.log(res);
      const user = res.user;
      // init repo flow
      if (!res.status) {
        createRepository(headers)
          .then((res) => {
            console.log("Created repository", res);
            uploadData(headers, { user: user, payload: data.localStorage });
          })
          .then((res) => {
            console.log(res);
          });
      } else {
        console.log("Repository already existed, uploading data");
        getFile(headers, user, repository).then((file) => {
          console.log("Data file", file);

          if (file.sha) {
            uploadData(headers, {
              user: user,
              payload: data.localStorage,
              sha: file.sha,
            }).then((res) => {
              console.log(res);
            });
          } else {
            uploadData(headers, {
              user: user,
              payload: data.localStorage,
            }).then((res) => {
              console.log(res);
            });
          }
        });
      }
    });
  }

  sendResponse(data);
});
