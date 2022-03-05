chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: dataload,
    });
});

async function dataload() {
    var divPR = document.querySelector("div.pull-right");

    problemId = document.querySelectorAll("td a")[1].innerText;
    sourcecode = document.querySelector("textarea").value;
    
    var body = {
      problemId:problemId,
      sourcecode:sourcecode
    };

    var githubBtn = document.createElement("button");
    githubBtn.innerText = "Github";
    githubBtn.onclick = function () {
        var githubConn = new XMLHttpRequest();
        var url = "http://localhost:8000/upload/github";
        githubConn.open("POST", url, false);
        githubConn.setRequestHeader("Content-Type","application/json;charset=UTF-8");
        githubConn.onreadystatechange = function () {
            console.log(githubConn.responseText);
        };
        
        githubConn.send(JSON.stringify(body));
    };

    var notionBtn = document.createElement("button");
    notionBtn.innerText = "Notion";
    notionBtn.onclick = function () {
      var notionConn = new XMLHttpRequest();
      var url = "http://localhost:8000/upload/notion";
      notionConn.open("POST", url, false);
      notionConn.setRequestHeader("Content-Type","application/json;charset=UTF-8");
      notionConn.onreadystatechange = function () {
          console.log(notionConn.responseText);
      };
      
      notionConn.send(JSON.stringify(body));
    };

    var allBtn = document.createElement("button");
    allBtn.innerText = "All";
    allBtn.onclick = function () {
      var allConn = new XMLHttpRequest();
      var url = "http://localhost:8000/upload/all";
      allConn.open("POST", url, false);
      allConn.setRequestHeader("Content-Type","application/json;charset=UTF-8");
      allConn.onreadystatechange = function () {
          console.log(allConn.responseText);
      };
      
      allConn.send(JSON.stringify(body));
    };

    divPR.appendChild(githubBtn);
    divPR.appendChild(notionBtn);
    divPR.appendChild(allBtn);
}
