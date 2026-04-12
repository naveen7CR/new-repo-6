const text = "JavaScript is a powerful language for web development.";
let startTime;

document.getElementById("text").innerText = text;

document.getElementById("input").addEventListener("focus", () => {
    startTime = new Date().getTime();
});

document.getElementById("input").addEventListener("input", () => {
    const entered = document.getElementById("input").value;

    if (entered === text) {
        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        const speed = Math.round((text.split(" ").length / timeTaken) * 60);

        document.getElementById("result").innerText =
            `🔥 Speed: ${speed} WPM | Time: ${timeTaken}s`;
    }
});