//https://stackoverflow.com/a/43043658/15031174
window.addEventListener("pageshow", function (event) {
    var historyTraversal = event.persisted ||
        (typeof window.performance != "undefined" &&
            window.performance.navigation.type === 2);
    if (historyTraversal) {
        window.location.reload();
    }
});

window.onload = function () {
    fetch('/get_extra_data')
        .then(async data => {
            try {
                data = await data.json();
            } catch (err) {
                console.error(err);
                if (!alert("You are not logged in. Please login to continue.")) return document.location = '/';
            }

            let flairs;
            try {
                flairs = await fetch('/getFlairs').then(data => data.json());
            } catch (err) {
                console.error(err);
                return alert("An error occured while fetching flairs");
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

            if (ownProfile.name === requestedProfile.name) {
                listProfile.classList.add("listSelected");
            }


            //Profile Info
            const profileExtraInfo = document.getElementById('profileExtraInfo');

            const profileDisplayName = document.getElementById('profileDisplayName');
            profileDisplayName.appendChild(document.createTextNode(requestedProfile.displayName));
            const profileName = document.getElementById('profileName');
            profileName.appendChild(document.createTextNode(requestedProfile.name));

            const followerCount = document.createElement('a');
            followerCount.id = 'followerCount';
            const followerCountSpan = document.createElement('span');
            followerCountSpan.appendChild(document.createTextNode(requestedProfile.followers.length));
            const followerTextSpan = document.createElement('span');
            followerTextSpan.appendChild(document.createTextNode(` Follower${requestedProfile.followers.length > 1 ? 's' : ''}`));
            followerCount.appendChild(followerCountSpan);
            followerCount.appendChild(followerTextSpan);

            const followingCount = document.createElement('a');
            followingCount.id = 'followingCount';
            const followingCountSpan = document.createElement('span');
            followingCountSpan.appendChild(document.createTextNode(requestedProfile.following.length));
            const followingTextSpan = document.createElement('span');
            followingTextSpan.appendChild(document.createTextNode(` Following`));
            followingCount.appendChild(followingCountSpan);
            followingCount.appendChild(followingTextSpan);

            console.log(requestedProfile)

            const profileAge = document.createElement('a');
            profileAge.id = 'profileAge';
            const profileAgeSpan = document.createElement('span');
            profileAgeSpan.appendChild(document.createTextNode(new Date(requestedProfile.creationDate).toLocaleDateString()));
            const profileAgeTextSpan = document.createElement('span');
            profileAgeTextSpan.appendChild(document.createTextNode(` Created`));
            profileAge.appendChild(profileAgeSpan);
            profileAge.appendChild(profileAgeTextSpan);

            profileExtraInfo.appendChild(followerCount);
            profileExtraInfo.appendChild(followingCount);
            profileExtraInfo.appendChild(profileAge);

            //Follow Button
            const followButton = document.getElementById('followButton');

            if (requestedProfile.followers.includes(ownProfile.uuid)) {
                followButton.innerText = 'Unfollow';
            }

            if (ownProfile.name === requestedProfile.name) {
                followButton.style.display = 'none';
            } else {
                followButton.addEventListener('click', () => {
                    fetch('/followUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: requestedProfile.name, type: followButton.innerText.toLocaleLowerCase() })
                    })
                        .then(data => data.json())
                        .then(data => {
                            if (data.success) {
                                followButton.innerText = followButton.innerText === 'Follow' ? 'Unfollow' : 'Follow';

                                //There is probably a better way to do this
                                if (followButton.innerText === 'Follow') {
                                    followerCountSpan.innerText = parseInt(followerCountSpan.innerText) - 1;
                                    followerTextSpan.innerText = `Follower${parseInt(followerCountSpan.innerText) > 1 ? 's' : ''}`;
                                } else {
                                    followerCountSpan.innerText = parseInt(followerCountSpan.innerText) + 1;
                                    followerTextSpan.innerText = `Follower${parseInt(followerCountSpan.innerText) > 1 ? 's' : ''}`;
                                }
                            } else {
                                alert(data.error);
                            }
                        });
                });
            };

            //Posts
            const posts = requestedProfile.posts;
            const postscontainer = document.getElementById('posts');

            posts.sort((a, b) => {
                return new Date(b.creationDate) - new Date(a.creationDate);
            });

            if (posts.length === 0) {
                const noPosts = document.createElement('div');
                noPosts.id = 'noPosts';
                noPosts.className = 'center';

                const noPostsImage = document.createElement('img');
                noPostsImage.src = '../logo/logo_trans_no-text.png';
                noPostsImage.className = 'image';
                noPosts.appendChild(noPostsImage);

                const noPostsText = document.createElement('p');
                noPostsText.id = 'noPostsText';
                noPostsText.appendChild(document.createTextNode('No posts yet, enjoy the view!'));
                noPosts.appendChild(noPostsText);

                postscontainer.appendChild(noPosts);
            }

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

                const postUserName = document.createElement('a');
                postUserName.className = 'postName';
                postUserName.href = `/user/${requestedProfile.name}`;
                postUserName.appendChild(document.createTextNode(`@${requestedProfile.name}`));

                const postDate = document.createElement('p');
                postDate.className = 'postDate';
                postDate.appendChild(document.createTextNode(handleDate(post)));

                const postFlair = document.createElement('div');
                if (post.flair) {
                    postFlair.className = 'flair postFlair';
                    postFlair.style = `--accentcolor: ${flairs.filter(flair => flair.name === post.flair)[0].color}`
                    postFlair.appendChild(document.createTextNode(post.flair));
                }

                const postcontent = document.createElement('p');
                postcontent.className = 'postContent';
                postcontent.appendChild(document.createTextNode(post.content));

                const postActionWrapper = document.createElement('div');
                postActionWrapper.className = 'postActionWrapper';

                const postActions = document.createElement('div');
                postActions.className = 'postActions';

                const postLike = document.createElement('div');
                postLike.className = 'postLike';

                const postLikeI = document.createElement('i');
                postLikeI.className = post.likes.includes(ownProfile.uuid) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                postLike.appendChild(postLikeI);

                const postLikeCount = document.createElement('span');
                postLikeCount.className = 'postLikeCount';
                postLikeCount.appendChild(document.createTextNode(post.likes.length));

                postLike.appendChild(postLikeCount);


                postActions.appendChild(postLike);
                postActionWrapper.appendChild(postActions);

                postUserCredentials.appendChild(postUserDisplayname);
                postUserCredentials.appendChild(postUserName);
                postUserCredentials.appendChild(postDate);
                postUserCredentials.appendChild(postFlair);

                postContentAndCredetialsWrapper.appendChild(postUserCredentials);
                postContentAndCredetialsWrapper.appendChild(postcontent);
                postContentAndCredetialsWrapper.appendChild(postActionWrapper);

                postcontainer.appendChild(postUserPic);
                postcontainer.appendChild(postContentAndCredetialsWrapper);

                postscontainer.appendChild(postcontainer);

                postLike.addEventListener('click', handleLike);
            });
        });
};

function handleLike(e) {
    const post = e.currentTarget.parentNode.parentNode.parentNode.parentNode;
    const like = e.currentTarget;
    const likeI = e.currentTarget.firstChild;

    fetch('/likePost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: post.id, type: likeI.className === 'fa-regular fa-heart' ? 'like' : 'unlike' })
    })
        .then(data => data.json())
        .then(data => {
            if (data.success) {
                if (likeI.className === 'fa-regular fa-heart') {
                    likeI.className = 'fa-solid fa-heart';
                    like.lastChild.innerText = parseInt(like.lastChild.innerText) + 1;
                } else {
                    likeI.className = 'fa-regular fa-heart';
                    like.lastChild.innerText = parseInt(like.lastChild.innerText) - 1;
                }
            } else {
                alert(data.error);
            }
        });
}

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
        return (timeSince(new Date(post.creationDate)) + " ago");
    }

    //More than 7 days ago
    else {
        const date = new Date(post.creationDate);
        const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
        const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
        if (year == new Date().getFullYear()) {
            return (`${month}, ${day}`);
        } else {
            return (`${month}, ${day} ${year}`);
        }
    }
}