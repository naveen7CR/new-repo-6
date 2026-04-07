// HABITS
function addHabit() {
    let input = document.getElementById("habitInput");
    let habit = input.value;

    if (habit === "") return;

    let li = document.createElement("li");
    li.innerHTML = `${habit} 
        <input type="checkbox" onchange="toggleDone(this)">
        <button onclick="this.parentElement.remove()">❌</button>`;

    document.getElementById("habitList").appendChild(li);
    input.value = "";
}

function toggleDone(checkbox) {
    if (checkbox.checked) {
        checkbox.parentElement.style.textDecoration = "line-through";
    } else {
        checkbox.parentElement.style.textDecoration = "none";
    }
}

// GOALS
function addGoal() {
    let input = document.getElementById("goalInput");
    let goal = input.value;

    if (goal === "") return;

    let div = document.createElement("div");
    div.classList.add("goal");
    div.innerHTML = `
        <p>${goal}</p>
        <button onclick="this.parentElement.remove()">Delete</button>
    `;

    document.getElementById("goalContainer").appendChild(div);
    input.value = "";
}

// PROGRESS
let progress = 0;

function increaseProgress() {
    if (progress < 100) {
        progress += 10;
        document.getElementById("progressBar").style.width = progress + "%";
    }
}

function resetProgress() {
    progress = 0;
    document.getElementById("progressBar").style.width = "0%";
}

// TIMER (Pomodoro)
let time = 1500;
let timerInterval;

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (time <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
            return;
        }
        time--;
        updateTimer();
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    time = 1500;
    updateTimer();
}

function updateTimer() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;

    document.getElementById("timer").innerText =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

updateTimer();

// EXTRA LARGE CODE FOR CONTRIBUTIONS

// RANDOM MOTIVATION
const messages = [
    "Keep going 🔥",
    "You are improving 📈",
    "Stay focused 🎯",
    "Discipline wins 💪"
];

function showMessage() {
    let msg = messages[Math.floor(Math.random() * messages.length)];
    console.log(msg);
}
setInterval(showMessage, 4000);

// LOCAL STORAGE SAVE
function saveData() {
    localStorage.setItem("habits", document.getElementById("habitList").innerHTML);
    localStorage.setItem("goals", document.getElementById("goalContainer").innerHTML);
}

function loadData() {
    document.getElementById("habitList").innerHTML =
        localStorage.getItem("habits") || "";
    document.getElementById("goalContainer").innerHTML =
        localStorage.getItem("goals") || "";
}

window.onload = loadData;

// AUTO SAVE
setInterval(saveData, 5000);

// SCROLL EFFECT
window.addEventListener("scroll", () => {
    console.log("User scrolling...");
});

// KEYBOARD SHORTCUT
document.addEventListener("keydown", (e) => {
    if (e.key === "g") {
        addGoal();
    }
});