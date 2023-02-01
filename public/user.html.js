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
            const requestedProfile = data.requestedUser;

            if (!ownProfile) return document.location = '/';
            if (!requestedProfile) return document.location = '/home';

            const h1 = document.createElement('h1');
            const h2 = document.createElement('h2');
            h1.appendChild(document.createTextNode(`Hello, ${ownProfile.displayName} (${ownProfile.name})!`));
            h2.appendChild(document.createTextNode(`You are viewing ${requestedProfile.displayName} (${requestedProfile.name})'s profile`));
            document.getElementById("main").appendChild(h1);
            document.getElementById("main").appendChild(h2);

            //Listmenu Buttons
            const listHome = document.getElementById('listHome');
            const listSearch = document.getElementById('listSearch');
            const listProfile = document.getElementById('listProfile');
            const listSettings = document.getElementById('listSettings');

            listHome.addEventListener('click', () => {
                document.location = '/home';
            });
            listSearch.addEventListener('click', () => {
                document.location = '/search';
            });
            listProfile.addEventListener('click', () => {
                document.location = `/user/${ownProfile.name || "unknown"}`;
            });
            listSettings.addEventListener('click', () => {
                document.location = '/settings';
            });
        });
};