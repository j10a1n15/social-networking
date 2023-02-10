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


            //Profile Info
            const profileDisplayName = document.getElementById('profileDisplayName');
            const profileName = document.getElementById('profileName');

            profileDisplayName.appendChild(document.createTextNode(requestedProfile.displayName));
            profileName.appendChild(document.createTextNode(requestedProfile.name));

            //Posts
            const posts = requestedProfile.posts;
            const postscontainer = document.getElementById('posts');

            console.log(posts)

            posts.forEach(post => {
                const postcontainer = document.createElement('div');
                postcontainer.id = post.id;
                postcontainer.className = 'post';

                const postUserPic = document.createElement('img');
                postUserPic.className = 'postUserPic';
                postUserPic.src = 'https://www.w3schools.com/howto/img_avatar.png';
                
                const postContentAndCredetialsWrapper = document.createElement('div');
                postContentAndCredetialsWrapper.className = 'postContentAndCredetialsWrapper';

                const postUserCredentials = document.createElement('div');
                postUserCredentials.className = 'postUserCredentials';

                const postUserDisplayname = document.createElement('p');
                postUserDisplayname.className = 'postDisplayName';
                postUserDisplayname.appendChild(document.createTextNode(requestedProfile.displayName));

                const postUserName = document.createElement('p');
                postUserName.className = 'postName';
                postUserName.appendChild(document.createTextNode(requestedProfile.name));

                const postDate = document.createElement('p');
                postDate.className = 'postDate';
                postDate.appendChild(document.createTextNode(handleDate(post)));

                const postcontent = document.createElement('p');
                postcontent.className = 'postContent';
                postcontent.appendChild(document.createTextNode(post.content));


                postUserCredentials.appendChild(postUserDisplayname);
                postUserCredentials.appendChild(postUserName);
                postUserCredentials.appendChild(postDate);

                postContentAndCredetialsWrapper.appendChild(postUserCredentials);
                postContentAndCredetialsWrapper.appendChild(postcontent);

                postcontainer.appendChild(postUserPic);
                postcontainer.appendChild(postContentAndCredetialsWrapper);

                postscontainer.appendChild(postcontainer);
            });
        });
};

function handleDate(post) {
    //Last 7 days ago
    if (Math.floor((new Date() - new Date(post.creationDate)) / 1000) < 604800) {
        function timeSince(date) {
            var seconds = Math.floor((new Date() - date) / 1000);
            var interval = seconds / 31536000;

            interval = seconds / 86400;
            if (interval > 1) {
                return Math.floor(interval) + ` day${Math.floor(interval) > 1 ? 's' : ''}`;
            }
            interval = seconds / 3600;
            if (interval > 1) {
                return Math.floor(interval) + ` hour${Math.floor(interval) > 1 ? 's' : ''}`;
            }
            interval = seconds / 60;
            if (interval > 1) {
                return Math.floor(interval) + ` minute${Math.floor(interval) > 1 ? 's' : ''}`;
            }
            return Math.floor(seconds) + " seconds";
        }
        return(timeSince(new Date(post.creationDate)) + " ago");
    }

    //More than 7 days ago
    else {
        const date = new Date(post.creationDate);
        const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
        const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
        if (year == new Date().getFullYear()) {
            return(`${month}, ${day}`);
        } else {
            return(`${month}, ${day} ${year}`);
        }
    }
}