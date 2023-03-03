window.onload = function () {
    fetch('/get_extra_data')
        .then(async data => {
            try {
                data = await data.json();
            } catch (err) {
                console.error(err);
                if (!alert("You are not logged in. Please login to continue.")) return document.location = '/';
            }

            const ownProfile = data.ownProfile;

            //Listmenu Buttons
            const listHome = document.getElementById('listHome');
            const listSearch = document.getElementById('listSearch');
            const listPost = document.getElementById('listPost');
            const listProfile = document.getElementById('listProfile');
            const listSettings = document.getElementById('listSettings');

            listHome.addEventListener('click', () => {
                document.location = '/home';
            });
            listSearch.addEventListener('click', () => {
                document.location = '/search';
            });
            listPost.addEventListener('click', () => {
                document.location = '/post';
            });
            listProfile.addEventListener('click', () => {
                document.location = `/user/${ownProfile.name || "unknown"}`;
            });
            listSettings.addEventListener('click', () => {
                document.location = '/settings';
            });

            //Search
            const searchInput = document.getElementById('searchInput');

            searchInput.focus();

            let typingTimer;
            let doneTypingInterval = 500;

            searchInput.onkeyup = function () {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(doneTyping, doneTypingInterval);
            };

            searchInput.onkeydown = function () {
                clearTimeout(typingTimer);
            };

            function doneTyping() {
                getSearch('/searchUser', {
                    name: searchInput.value
                }).then(function (data) {
                    if (data.success) {
                        const searchResults = document.getElementById('searchResults');

                        searchResults.innerHTML = "";

                        if(!data.users.length > 0) return searchResults.innerHTML = "<h1>No results found.</h1>";

                        data.users.forEach(user => {
                            const userDiv = document.createElement('div');
                            userDiv.classList.add('userDiv');

                            const userPfp = document.createElement('img');
                            userPfp.classList.add('userPfp');
                            userPfp.classList.add('sameLine');
                            userPfp.src = user.pfp || "https://www.w3schools.com/howto/img_avatar.png";

                            const userDivName = document.createElement('div');
                            userDivName.classList.add('userDivName');
                            userDivName.innerHTML = `<h1>${user.displayName}</h1><br><h3>${user.name}</h3>`;

                            const userDivText = document.createElement('div');
                            userDivText.classList.add('userDivText');
                            userDivText.classList.add('sameLine');

                            userDivText.appendChild(userDivName);

                            userDiv.appendChild(userPfp);
                            userDiv.appendChild(userDivText);

                            searchResults.appendChild(userDiv);

                            userDiv.addEventListener('click', () => {
                                document.location = `/user/${user.name}`;
                            });
                        });

                    } else {
                        console.error("Something went wrong.");

                        const searchResults = document.getElementById('searchResults');

                        searchResults.innerHTML = "<h1>Something went wrong.</h1>";
                    }
                });
            }
        });
};

function getSearch(url, body) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)

                resolve(data);
            });
    });
}