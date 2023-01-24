window.onload = function () {
    fetch('/get_extra_data')
        //.then(response => response.json())
        .then(async data => {
            try {
                data = await data.json();
            } catch (err) {
                console.error(err);
                if (!alert("You are not logged in. Please login to continue.")) return document.location = '/';
            }

            const h1 = document.createElement('h1');
            h1.appendChild(document.createTextNode(`Hello, ${data.displayName} (${data.name})!`));
            document.body.appendChild(h1);
        });
};