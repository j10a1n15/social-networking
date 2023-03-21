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

            const h1 = document.createElement('h1');
            h1.appendChild(document.createTextNode(`Hello, ${ownProfile.displayName} (${ownProfile.name})!`));
            document.getElementById("mainBackground").appendChild(h1);

            //Listmenu Buttons
            const listHome = document.getElementById('listHome');
            const listSearch = document.getElementById('listSearch');
            const listPost = document.getElementById('listPost');
            const listProfile = document.getElementById('listProfile');
            const listSettings = document.getElementById('listSettings');
            const listLogout = document.getElementById('listLogout');

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
            listLogout.addEventListener('click', () => {
                fetch("/logout", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            document.location = '/';
                        } else {
                            alert("Something went wrong. Please try again.");
                        }
                    });
            });
        });
};