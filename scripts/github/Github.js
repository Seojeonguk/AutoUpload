import * as Github from "./constants.js";
import * as Util from "../util.js";

/**
 * Dispatches an action with an optional payload to the appropriate handler function.
 * If the action is to open the GitHub OAuth authorization page, it calls the function
 * to open the page. If the action is to request and save an access token, it calls
 * the function to perform the request and save the token.
 *
 * @param {string} action - The action to be dispatched.
 * @param {Object} payload - The optional payload associated with the action.
 */
async function dispatch(action, payload) {
  if (action === Github.OPEN_OAUTH_PAGE) {
    openGithubOauthPage();
  } else if (action === Github.REQUEST_AND_SAVE_ACCESS_TOKEN) {
    const accessToken = requestAndSaveAccessToken(payload);
    getAuthenticatedUserInfo(accessToken);
  } else if (action === Github.GET_AUTHENTICATED_USER_REPOSITORIES) {
    const repositories = await getAuthenticatedUserRepositories(payload);
    return repositories;
  } else if (action === Github.COMMIT) {
    return await commit(payload);
  }
}

/**
 * Commits the source code to the GitHub repository.
 *
 * @param {Object} payload - Payload containing information related to the problem.
 * @throws {Error} If an error occurs during the commit process.
 */
async function commit(payload) {
  // Add more..
}

/**
 * Fetches repositories owned by the authenticated user from the GitHub API.
 * Before making the request, it verifies the presence of the access token.
 * Throws an error if the access token is not found in the local storage.
 * Throws an error if the API request to fetch repositories fails.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of repositories.
 * @throws {Error} If the access token is not found or if the API request fails.
 */
async function getAuthenticatedUserRepositories() {
  const accessToken = await Util.getChromeStorage("githubAccessToken");
  if (Util.isEmpty(accessToken)) {
    throw new Error("Invalid access token for requesting user repositories.");
  }

  const url = `${Github.API_BASE_URL}/user/repos?type=owner`;
  const headers = {
    accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await Util.request(url, "GET", headers, undefined);
  if (!response.ok) {
    throw new Error("Failed to fetch repositories.");
  }
  const repositories = await response.json();

  return repositories;
}

/**
 * Retrieves authenticated user information using the GitHub API.
 * @param {string} accessToken - The access token for authentication.
 * @throws {Error} Throws an error if the access token is falsy or if fetching user information fails.
 */
async function getAuthenticatedUserInfo(accessToken) {
  if (Util.isEmpty(accessToken)) {
    throw new Error("Invalid access token for requesting user information.");
  }

  const url = `${this.GITHUB_API_BASE_URL}/user`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await Util.request(url, "GET", headers, undefined);
  if (!response.ok) {
    throw new Error("Failed to fetch user information.");
  }

  const json = await response.json();
  const githubID = json.login;
  if (Util.isEmpty(githubID)) {
    throw new Error("Github ID not found.");
  }

  chrome.storage.local.set({ githubID: githubID });
}

/**
 * Opens the GitHub OAuth authorization page in a new browser tab.
 * The authorization page URL is constructed using the GitHub client ID,
 * optional redirect URL, and optional scopes. If the redirect URL or scopes
 * are provided, they are appended to the authorization page URL as query parameters.
 */
function openGithubOauthPage() {
  let parameters = `client_id=${Github.CLIENT_ID}`;
  if (Github.REDIRECT_URL) {
    parameters += `&redirect_url=${Github.REDIRECT_URL}`;
  }
  if (Github.SCOPES) {
    parameters += `&scope=${Github.SCOPES[0]}`;
  }
  const url = `${Github.BASE_URL}/login/oauth/authorize?${parameters}`;

  chrome.tabs.create({ url: url });
}

/**
 * Requests an access token from the GitHub API using the provided payload,
 * which should contain a code obtained from the OAuth authorization flow.
 * Upon successful retrieval, the access token is saved to the local storage.
 *
 * @param {Object} payload - The payload containing the authorization code.
 * @throws {Error} If the payload object is invalid or if the code is missing or invalid.
 * @throws {Error} If the API request fails or if the access token is not found in the response.
 */
async function requestAndSaveAccessToken(payload) {
  if (Util.isEmpty(payload)) {
    throw new Error("Invalid payload object for reqeusting access token.");
  }

  const { code } = payload;
  if (Util.isEmpty(code)) {
    throw new Error("Invalid code for requesting access token.");
  }

  const url = `${Github.BASE_URL}/login/oauth/access_token`;

  const data = new FormData();
  data.append("client_id", Github.CLIENT_ID);
  data.append("client_secret", Github.CLIENT_SECRET);
  data.append("code", code);

  const response = await Util.request(url, "POST", undefined, data);
  if (!response.ok) {
    throw new Error("Failed to fetch access token.");
  }

  const text = await response.text();
  const matchResult = text.match(/access_token=([^&]*)/);

  if (Util.isEmpty(matchResult) || matchResult.length < 2) {
    throw new Error("Access token not found.");
  }

  const accessToken = matchResult[1];
  chrome.storage.local.set({ githubAccessToken: accessToken });

  return accessToken;
}

export { dispatch };
