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

            console.log(`${ownProfile.name} is now viewing ${requestedProfile.name}'s profile`);

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

            //Profile Info
            const profileDisplayName = document.getElementById('profileDisplayName');
            const profileName = document.getElementById('profileName');

            profileDisplayName.appendChild(document.createTextNode(requestedProfile.displayName));
            profileName.appendChild(document.createTextNode(requestedProfile.name));
        });
};