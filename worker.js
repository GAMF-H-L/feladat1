let count = 0;

onmessage = function (event) {
    if (event.data === "increment") {
        count++;
        postMessage(count);
    }
};

