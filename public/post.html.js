let selectedFlair = null;

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


            let flairs;
            try {
                flairs = await fetch('/getFlairs').then(data => data.json());
            } catch (err) {
                console.error(err);
                return alert("An error occured while fetching flairs");
            }


            const content = document.getElementById('content');
            content.focus();

            document.getElementById('createPost').addEventListener('click', async () => {

                if (!content.value) return alert("Please enter some content");

                const data = await fetch('/createPost', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: content.value,
                        flair: selectedFlair ? selectedFlair.name : null
                    })
                }).then(data => data.json());

                if (data.error) return alert(data.error);
                alert(data.success);
                content.value = "";
            });


            const flairDropdownButton = document.getElementById('flairDropdownButton');
            const flairDropdown = document.getElementById('flairDropdown');
            const flairDropdownContainer = document.getElementById('flairDropdownContainer');


            flairDropdownButton.addEventListener('click', () => {
                flairDropdown.classList.toggle('hidden');
            });



            flairs.forEach(flair => {
                const option = document.createElement('option');
                option.value = flair.name;
                option.innerText = flair.name;
                option.classList.add('flair');
                option.classList.add(flair.name);
                option.style = `--accentcolor: ${flair.color};`

                option.addEventListener('click', () => {
                    if (selectedFlair == flair) {
                        selectedFlair = null;
                        document.getElementsByClassName(flair.name)[0].classList.remove('selected');
                    } else {
                        selectedFlair = flair;
                        [...document.getElementsByClassName("flair")].forEach(item => {
                            item.classList.remove('selected');
                        });
                        document.getElementsByClassName(flair.name)[0].classList.add('selected');
                    }
                });
                flairDropdownContainer.appendChild(option);
            });
            flairDropdown.appendChild(flairDropdownContainer);



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
        });
};