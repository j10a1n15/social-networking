window.onload = function () {
    fetch('/get_extra_data')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const h1 = document.createElement('h1');
            h1.appendChild(document.createTextNode(`Hello, ${data.displayName} (${data.name})!`));
            document.body.appendChild(h1);
        });
};