const GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";

let data = {
  github_pat: "",
  localStorage: undefined,
};

const repository = "excalisync-data";

async function isExistRepository(headers) {
  // Check user
  const res = await fetch(`${GITHUB_API_URL}/user`, {
    headers: headers,
  });

  const parsed = await res.json();
  console.log(parsed);

  if (parsed.login) {
    // Check repo
    const res = await fetch(
      `${GITHUB_API_URL}/repos/${parsed.login}/${repository}`,
      {
        headers: headers,
      }
    );

    const data = await res.json();

    if (data.id) {
      return { userId: parsed.login, status: true };
    } else {
      return { userId: parsed.login, status: false };
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.localStorage) {
    data.localStorage = message.localStorage;
  }

  if (message.github_pat) {
    data.github_pat = message.github_pat;
  }

  console.log(data);

  const headers = new Headers({
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${data.github_pat}`,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  });

  if (data.github_pat.length > 0 && data.localStorage) {
    isExistRepository(headers).then((res) => {
      console.log(res);
      // init repo flow
      if (!res.status) {
        createRepository(headers).then((res) => {
          console.log(res);
        });
      } else {
        console.log("Repository already existed");
      }
    });
  }

  sendResponse(data);
});