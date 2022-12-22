// To do list
// 1. notion upload button
// 2. github upload button
// 3. all upload button
$(function () {
  const btnWrap = createBtnWrap();
  createGithubBtn(btnWrap, 0);
});

function createBtnWrap() {
  const addingElement = $(".CodeMirror");

  const btnWrap = document.createElement("div");

  btnWrap.style.position = "absolute";
  btnWrap.style.top = 0;
  btnWrap.style.right = 0;
  btnWrap.style.zIndex = 9999;
  btnWrap.style.padding = "10px";

  addingElement.append(btnWrap);

  return btnWrap;
}

function createGithubBtn(btnWrap, isDarkmode) {
  const githubBtn = document.createElement("a");
  githubBtn.href = "#";
  githubBtn.style.cursor = "pointer";
  githubBtn.onclick = function (e) {
    // To do more..
    // Request server
  };

  var githubURL = "icon/githubIcon.png";
  if (isDarkmode) {
    githubURL = "icon/githubDarkIcon.png";
  }

  githubBtn.innerHTML = `<img src="${chrome.runtime.getURL(
    githubURL
  )}" alt="github" style="width:32px; height:32px;" />`;

  btnWrap.append(githubBtn);
}
