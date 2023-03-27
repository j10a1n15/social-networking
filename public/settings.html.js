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

            //Password
            const oldpw = document.getElementById('settingsOldPassword');
            const newpw = document.getElementById('settingsNewPassword');
            const confirmnewpw = document.getElementById('settingsConfirmPassword');
            const submitpw = document.getElementById('settingsButtonChangePassword');

            submitpw.addEventListener('click', () => {
                if (newpw.value != confirmnewpw.value) return alert("Passwords do not match.");
                fetch('/change_password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        oldpw: oldpw.value,
                        newpw: newpw.value
                    })
                })
                    .then(async data => {
                        try {
                            data = await data.json();
                        } catch (err) {
                            console.error(err);
                            return alert("An error occured.");
                        }
                        if (data.success) {
                            alert("Password changed successfully.");
                            document.location = '/settings';
                        } else {
                            alert("An error occured.");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        alert("An error occured.");
                    });
            });

            //Email
            const oldemail = document.getElementById('settingsOldEmail');
            const newemail = document.getElementById('settingsNewEmail');
            const confirmnewemail = document.getElementById('settingsConfirmEmail');
            const submitemail = document.getElementById('settingsButtonChangeEmail');

            submitemail.addEventListener('click', () => {
                if (newemail.value != confirmnewemail.value) return alert("Emails do not match.");
                fetch('/change_email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        oldemail: oldemail.value,
                        newemail: newemail.value
                    })
                })
                    .then(async data => {
                        try {
                            data = await data.json();
                        } catch (err) {
                            console.error(err);
                            return alert("An error occured.");
                        }
                        if (data.success) {
                            alert("Email changed successfully.");
                            document.location = '/settings';
                        } else {
                            alert("An error occured.");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        alert("An error occured.");
                    });
            });

            //Displayname
            const newdisplayname = document.getElementById('settingsNewDisplayName');
            const confirmnewdisplayname = document.getElementById('settingsConfirmDisplayName');
            const submitdisplayname = document.getElementById('settingsButtonChangeDisplayName');

            submitdisplayname.addEventListener('click', () => {
                if (newdisplayname.value != confirmnewdisplayname.value) return alert("Displaynames do not match.");
                fetch('/change_displayname', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        newdisplayname: newdisplayname.value
                    })
                })
                    .then(async data => {
                        try {
                            data = await data.json();
                        } catch (err) {
                            console.error(err);
                            return alert("An error occured.");
                        }
                        if (data.success) {
                            alert("Displayname changed successfully.");
                            document.location = '/settings';
                        } else {
                            alert("An error occured.");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        alert("An error occured.");
                    });
            });

            //Username
            const newusername = document.getElementById('settingsNewUsername');
            const confirmnewusername = document.getElementById('settingsConfirmUsername');
            const submitusername = document.getElementById('settingsButtonChangeUsername');

            submitusername.addEventListener('click', () => {
                if (newusername.value != confirmnewusername.value) return alert("Usernames do not match.");
                fetch('/change_username', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        newusername: newusername.value
                    })
                })
                    .then(async data => {
                        try {
                            data = await data.json();
                        } catch (err) {
                            console.error(err);
                            return alert("An error occured.");
                        }
                        if (data.success) {
                            alert("Username changed successfully.");
                            document.location = '/settings';
                        } else {
                            alert("An error occured.");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        alert("An error occured.");
                    });
            });
        });
}