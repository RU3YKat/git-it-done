var userFormEl = document.querySelector("#user-form");
var nameInputEl = document.querySelector("#username");
var languageButtonsEl = document.querySelector("#language-buttons");
var repoContainerEl = document.querySelector("#repos-container");
var repoSearchTerm = document.querySelector("#repo-search-term");

var formSubmitHandler = function(event) {
    // prevent page from refreshing
    event.preventDefault();

    // get value from input element, trimming to remove any leading or trailing spaces
    var username = nameInputEl.value.trim();

    if (username) {
        // if username has a value, pass as argument into getUserRepos function and run
        getUserRepos(username);

        // then clear the input field
        repoContainerEl.textContent = "";
        nameInputEl.value = "";
    } else {
        // if username has no value, display alert
        alert("Please enter a GitHub username");
    }
};

var buttonClickHandler = function(event) {
    var language = event.target.getAttribute("data-language");

    if (language) {
        getFeaturedRepos(language);

        // clear old content
        // will always run last bc getFeaturedRepos() is asynchronous 
        // and will take longer to get reponse from GitHub's API
        repoContainerEl.textContent = "";
    }
};

var getUserRepos = function(user) {
    // format the github api url, adding submitted user value to string
    var apiUrl = "https://api.github.com/users/" + user + "/repos";

    // make a request to the url
    fetch(apiUrl)
        .then(function(response) {
        // error handler for 404, username DNE
        // checks if successful request by using the .ok property
            // when HTTP request status code is in the 200s, ok property will be true
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
                displayRepos(data, user);
            });
        // if ok property is false, something is wrong with HTTP request, alert user
        } else {
            alert("Error: GitHub User Not Found.");
        }
    })
        // .catch is fetch APIs way of handling network errors...when fetch() makes request, two results:
            // request finds destination url and attempts to get the data, which is returned into the .then() method above, or
            // error gets sent to .catch() method
        .catch(function(error) {
            // notice this `.catch()` getting chained onto the end of the `.then()`
            alert("Unable to connect to GitHub");
        });
};

var getFeaturedRepos = function(language) {
    // format the github api url
    var apiUrl = "https://api.github.com/search/repositories?q=" + language + "is:featured&sort=help-wanted-issues";

    // make a get request to url
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            // json() method's callback function (passing data.items and language parameters)
            response.json().then(function(data) {
                displayRepos(data.items, language);
            });
        } else {
            alert("Error: " + response.statusText);
        }
    });
};

var displayRepos = function(repos, searchTerm) {
    // first check for an empty array for user repos, then let user know there is nothing to display
    if (repos.length === 0) {
        repoContainerEl.textContent = "No repositories found.";
        return;
    }
    
    repoSearchTerm.textContent = searchTerm;
  
    // loop over repos
    // take each repository ("repos[i]") and write some of its data to the page
    for (var i = 0; i < repos.length; i++) {
        // format repo name (each repository = repos[i])
        var repoName = repos[i].owner.login + "/" + repos[i].name;

        // create a container for each repo - create and style the div element
        var repoEl = document.createElement("a");
        repoEl.classList = "list-item flex-row justify-space-between align-center";
        repoEl.setAttribute("href", "./single-repo.html?repo=" + repoName);

        // create a span element to hold repository name - and format it
        var titleEl = document.createElement("span");
        // take the <span> that holds the formatted repository name and add it to the <div>
        titleEl.textContent = repoName;

        // append to container - add to <div>
        repoEl.appendChild(titleEl);

            // add number of issues to each repo and add icon next to it to help
            // identify which repositories need help at the moment

            // create a status element
            var statusEl = document.createElement("span");
            statusEl.classList = "flex-row align-center";

            // check if current repo has issues or not
            // if number of issues > 0, then display and add a red X icon beside
            if (repos[i].open_issues_count > 0) {
                statusEl.innerHTML = 
                    "<i class='fas fa-times status-icon icon-danger'></i>" + repos[i].open_issues_count + " issue(s)";
            // if number of issues (!number of issues > 0), then display with a blue check mark instead
            } else {
                statusEl.innerHTML = "<i class ='fas fa-check-square status-icon icon-success'></i>";
            }

            // append to container
            repoEl.appendChild(statusEl);

        // append container to the DOM - add to <div>
        repoContainerEl.appendChild(repoEl);
    }
};

// starts here with event listener on submit button
// when submit ("Get User") button is clicked, run formSubmitHandler()
userFormEl.addEventListener("submit", formSubmitHandler);

// starts here with event listener on search by topic button
// when click (a topic language button) occurs, run buttonClickHandler()
languageButtonsEl.addEventListener("click", buttonClickHandler);