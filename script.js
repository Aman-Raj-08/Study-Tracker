const studyForm = document.getElementById("study-form");
const sessionList = document.getElementById("session-list");
const totalHours = document.getElementById("total-hours");
const todayHours = document.getElementById("today-hours");
const sessionCount = document.getElementById("session-count");
const streakCount = document.getElementById("streak-count");
const studyDate = document.getElementById("study-date");
const notesInput = document.getElementById("notes");
const dailyGoal = document.getElementById("daily-goal");
const savedGoalButton = document.getElementById("save-goal");
const goalProgressBar = document.getElementById("goal-progress-bar");
const goalText = document.getElementById("goal-text");
const goalStatus = document.getElementById("goal-status");
const weeklyTarget = document.getElementById("weekly-target");
const weeklyStudied = document.getElementById("weekly-studied");
const weeklyProgressBar = document.getElementById("weekly-progress-bar");
const weeklyGoalText = document.getElementById("weekly-goal-text");
const weeklyGoalInput = document.getElementById("weekly-goal");
const saveWeeklyGoalButton = document.getElementById("save-weekly-goal");
const achievementsContainer = document.getElementById("achievements-container");
const exportCSVButton = document.getElementById("export-csv");
const backupJSONButton = document.getElementById("backup-json");
const restoreJSONInput = document.getElementById("restore-json");
const clearDataButton = document.getElementById("clear-data");

const searchSessionsInput = document.getElementById("search-sessions");
const filterSubjectSelect = document.getElementById("filter-subject");
const sortSessionsSelect = document.getElementById("sort-sessions");

const timerDisplay = document.getElementById("timer-display");
const startButton = document.getElementById("start-timer");
const pauseButton = document.getElementById("pause-timer");
const resetButton = document.getElementById("reset-timer");
const timerStatus = document.getElementById("timer-status");
const customDurationInput = document.getElementById("custom-minutes");
const setCustomDurationButton = document.getElementById("set-custom-timer");
const timerModeButtons = document.querySelectorAll(".timer-mode");


let sessions = JSON.parse(
    localStorage.getItem("studySessions")
) || [];

let savedGoal = Number(
    localStorage.getItem("dailyGoal")
) || 4;

let savedWeeklyGoal = Number(
    localStorage.getItem("weeklyGoal")
) || 28;

let timerDuration = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let lastTimerMinutes = 25;


const achievements = [
    { id: "first-session", icon: "🌱", title: "First Step", description: "Complete your first study session." },
    { id: "ten-sessions", icon: "📚", title: "Getting Serious", description: "Complete 10 study sessions." },
    { id: "ten-hours", icon: "⏱️", title: "10 Hours", description: "Study for 10 total hours." },
    { id: "fifty-hours", icon: "💎", title: "50 Hours", description: "Study for 50 total hours." },
    { id: "three-day-streak", icon: "🔥", title: "3-Day Streak", description: "Study for 3 consecutive days." },
    { id: "goal-crusher", icon: "🎯", title: "Goal Crusher", description: "Complete today's study goal." }
];

const studyQuotes = [
    "Small steps every day beat one big push once in a while.",
    "You don't have to see the whole staircase, just take the next step.",
    "Progress, not perfection.",
    "The expert in anything was once a beginner.",
    "Discipline is choosing between what you want now and what you want most.",
    "Done is better than perfect — keep the streak alive.",
    "Focus on being productive instead of busy.",
    "A little bit today is better than a lot someday.",
    "Consistency beats intensity, almost every time."
];

const studyTips = [
    "Try the Pomodoro technique — 25 minutes of focused work, then a 5-minute break. It's built right into the timer above.",
    "Studying the same material at increasing intervals (spaced repetition) beats cramming almost every time.",
    "Teaching a concept out loud, even to an empty room, is one of the fastest ways to find the gaps in your understanding.",
    "A short walk before a study session can improve focus more than an extra cup of coffee.",
    "Switching subjects partway through a session (interleaving) tends to help long-term retention more than sticking to one topic for hours.",
    "Put your phone in another room. It sounds obvious, but it's still the single biggest lever most people have.",
    "Write down what you expect to struggle with before you start — it primes your brain to notice it faster."
];

let subjectChart = null;
let weeklyChart = null;

studyDate.value = new Date().toISOString().split("T")[0];
dailyGoal.value = savedGoal;
weeklyGoalInput.value = savedWeeklyGoal;

refreshAll();
updateTimerDisplay();
updateDailyQuote();

studyForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const subject = document.getElementById("subject").value;
    const topic = document.getElementById("topic").value.trim();
    const duration = Number(document.getElementById("duration").value);
    const selectDate = studyDate.value;
    const notes = notesInput ? notesInput.value.trim() : "";

    if (topic === "" || duration <= 0 || selectDate === "") {
        alert("Please fill in a topic, a duration, and a date before saving.");
        return;
    }

    const session = {
        subject: subject,
        topic: topic,
        duration: duration,
        date: selectDate,
        notes: notes
    };

    sessions.push(session);

    saveSessions();
    refreshAll();

    studyForm.reset();
    studyDate.value = new Date().toISOString().split("T")[0];
});


function saveSessions() {
    localStorage.setItem("studySessions", JSON.stringify(sessions));
}

function refreshAll() {
    displaySessions();
    updateDashboard();
    updateChart();
    updateStreak();
    updateWeeklyChart();
    updateGoal();
    updateWeeklyGoal();
    updateAchievements();
    updateActivityCalendar();
    updateInsights();
}


function populateSubjectFilterOptions() {
    if (!filterSubjectSelect) return;

    const currentValue = filterSubjectSelect.value;
    const subjects = [...new Set(sessions.map(s => s.subject))];

    filterSubjectSelect.innerHTML = '<option value="all">All Subjects</option>';

    subjects.forEach(function (subject) {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        filterSubjectSelect.appendChild(option);
    });

    if (subjects.includes(currentValue)) {
        filterSubjectSelect.value = currentValue;
    }
}

function getFilteredEntries() {
    const searchTerm = (searchSessionsInput ? searchSessionsInput.value : "").toLowerCase().trim();
    const subjectFilterValue = filterSubjectSelect ? filterSubjectSelect.value : "all";
    const sortValue = sortSessionsSelect ? sortSessionsSelect.value : "newest";

    // Keep the original index attached so edit/delete still target the right session
    let entries = sessions.map(function (session, index) {
        return { session: session, index: index };
    });

    if (subjectFilterValue !== "all") {
        entries = entries.filter(entry => entry.session.subject === subjectFilterValue);
    }

    if (searchTerm !== "") {
        entries = entries.filter(function (entry) {
            const topicMatch = entry.session.topic.toLowerCase().includes(searchTerm);
            const subjectMatch = entry.session.subject.toLowerCase().includes(searchTerm);
            const notesMatch = (entry.session.notes || "").toLowerCase().includes(searchTerm);
            return topicMatch || subjectMatch || notesMatch;
        });
    }

    entries.sort(function (a, b) {
        if (sortValue === "oldest") return a.session.date.localeCompare(b.session.date);
        if (sortValue === "longest") return b.session.duration - a.session.duration;
        if (sortValue === "shortest") return a.session.duration - b.session.duration;
        return b.session.date.localeCompare(a.session.date); // newest first, default
    });

    return entries;
}

if (searchSessionsInput) searchSessionsInput.addEventListener("input", displaySessions);
if (filterSubjectSelect) filterSubjectSelect.addEventListener("change", displaySessions);
if (sortSessionsSelect) sortSessionsSelect.addEventListener("change", displaySessions);


function displaySessions() {

    populateSubjectFilterOptions();

    sessionList.innerHTML = "";

    if (sessions.length === 0) {
        sessionList.innerHTML = "<p>No study sessions recorded yet. Add your first one below!</p>";
        return;
    }

    const entries = getFilteredEntries();

    if (entries.length === 0) {
        sessionList.innerHTML = "<p>Nothing matches your search or filter right now.</p>";
        return;
    }

    entries.forEach(function (entry) {
        const session = entry.session;
        const index = entry.index;

        const sessionItem = document.createElement("div");

        sessionItem.innerHTML = `
            <h3>${session.subject}</h3>
            <p>Topic: ${session.topic}</p>
            <p>Duration: ${session.duration} hours</p>
            ${session.notes ? `<p>Notes: ${session.notes}</p>` : ""}
            <small>Date: ${session.date}</small>
            <div>
                <button class="edit-btn" onclick="editSession(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteSession(${index})">Delete</button>
            </div>
        `;

        sessionList.appendChild(sessionItem);
    });
}

function updateDashboard() {

    let totalHoursStudied = 0;
    let todayHoursStudied = 0;

    const today = new Date().toISOString().split("T")[0];

    sessions.forEach(function (session) {
        totalHoursStudied += Number(session.duration);
        if (session.date === today) {
            todayHoursStudied += Number(session.duration);
        }
    });

    totalHours.textContent = totalHoursStudied.toFixed(1);
    todayHours.textContent = todayHoursStudied.toFixed(1);
    sessionCount.textContent = sessions.length;
}

function updateChart() {

    const chartCanvas = document.getElementById("subject-chart");

    if (subjectChart) {
        subjectChart.destroy();
    }

    const subjectTotal = {};

    sessions.forEach(function (session) {
        if (subjectTotal[session.subject]) {
            subjectTotal[session.subject] += session.duration;
        } else {
            subjectTotal[session.subject] = session.duration;
        }
    });

    const subjects = Object.keys(subjectTotal);
    const studyHoursData = Object.values(subjectTotal);

    if (subjects.length === 0) {
        return;
    }

    subjectChart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: subjects,
            datasets: [{ label: "Study Time", data: studyHoursData }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
        }
    });
}

function deleteSession(index) {
    const confirmDelete = confirm("Delete this session? There's no undo for this one.");

    if (!confirmDelete) {
        return;
    }

    sessions.splice(index, 1);

    saveSessions();
    refreshAll();
}

function editSession(index) {
    const session = sessions[index];

    const newTopic = prompt("Update the topic:", session.topic);
    if (newTopic === null) return;

    const newDuration = prompt("Update the duration (hours):", session.duration);
    if (newDuration === null) return;

    const newNotes = prompt("Update the notes (optional):", session.notes || "");
    if (newNotes === null) return;

    const durationNumber = Number(newDuration);

    if (newTopic.trim() === "" || durationNumber <= 0) {
        alert("That doesn't look like a valid topic or duration — nothing was changed.");
        return;
    }

    session.topic = newTopic.trim();
    session.duration = durationNumber;
    session.notes = newNotes.trim();

    saveSessions();
    refreshAll();
}

function updateStreak() {

    if (sessions.length === 0) {
        streakCount.textContent = "0";
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const studyDates = [...new Set(sessions.map(s => s.date))];

    studyDates.sort((a, b) => b.localeCompare(a));

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    if (studyDates[0] !== todayString) {
        streakCount.textContent = "0";
        return;
    }

    let streak = 1;

    for (let i = 0; i < studyDates.length - 1; i++) {
        const currentDate = new Date(studyDates[i]);
        const previousDate = new Date(studyDates[i + 1]);

        currentDate.setHours(0, 0, 0, 0);
        previousDate.setHours(0, 0, 0, 0);

        const difference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

        if (difference === 1) {
            streak++;
        } else {
            break;
        }
    }
    streakCount.textContent = streak;
}

function updateWeeklyChart() {

    const weeklyCanvas = document.getElementById("weekly-chart");
    if (!weeklyCanvas) return;

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    const today = new Date();
    const labels = [];
    const dailyHours = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateString = year + "-" + month + "-" + day;

        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        labels.push(dayName);

        let hours = 0;
        sessions.forEach(function (session) {
            if (session.date === dateString) {
                hours += Number(session.duration);
            }
        });

        dailyHours.push(hours);
    }

    weeklyChart = new Chart(weeklyCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{ label: "Study Time (hours)", data: dailyHours }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}


savedGoalButton.addEventListener("click", function () {
    const newGoal = Number(dailyGoal.value);

    if (newGoal <= 0) {
        alert("Please enter a valid daily goal.");
        return;
    }
    savedGoal = newGoal;

    localStorage.setItem("dailyGoal", savedGoal);
    updateGoal();
    updateAchievements();

    alert("Daily goal saved!");
});

function updateGoal() {
    const today = new Date().toISOString().split("T")[0];

    let todayHoursStudied = 0;

    sessions.forEach(function (session) {
        if (session.date === today) {
            todayHoursStudied += Number(session.duration);
        }
    });

    const progress = Math.min((todayHoursStudied / savedGoal) * 100, 100);

    goalProgressBar.style.width = progress + "%";

    goalText.textContent =
        todayHoursStudied.toFixed(1) + " / " + savedGoal.toFixed(1) + " hours";

    if (todayHoursStudied >= savedGoal) {
        goalStatus.textContent = "🎉 Daily goal completed!";
    } else {
        const remaining = savedGoal - todayHoursStudied;
        goalStatus.textContent = `${remaining.toFixed(1)} hours remaining 💪`;
    }
}

function updateWeeklyGoal() {
    const target = savedWeeklyGoal;
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    let weeklyHours = 0;

    sessions.forEach(function (session) {
        const sessionDate = new Date(session.date);
        if (sessionDate >= sevenDaysAgo && sessionDate <= today) {
            weeklyHours += Number(session.duration);
        }
    });

    let percentage = (weeklyHours / target) * 100;
    if (percentage > 100) percentage = 100;

    weeklyTarget.textContent = `${target.toFixed(1)} hours`;
    weeklyStudied.textContent = `${weeklyHours.toFixed(1)} hours`;
    weeklyProgressBar.style.width = percentage + "%";
    weeklyGoalText.textContent = `${weeklyHours.toFixed(1)} / ${target.toFixed(1)} hours`;
}

saveWeeklyGoalButton.addEventListener("click", function () {
    const newWeeklyGoal = Number(weeklyGoalInput.value);

    if (newWeeklyGoal <= 0) {
        alert("Please enter a weekly goal greater than 0.");
        return;
    }
    savedWeeklyGoal = newWeeklyGoal;
    localStorage.setItem("weeklyGoal", savedWeeklyGoal);
    updateWeeklyGoal();
    alert("Weekly goal saved!");
});

const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});


function updateAchievements() {

    achievementsContainer.innerHTML = "";

    let totalHoursAll = 0;
    sessions.forEach(function (session) {
        totalHoursAll += Number(session.duration);
    });

    let currentStreak = 0;
    if (sessions.length > 0) {
        currentStreak = Number(streakCount.textContent);
    }

    const today = new Date().toISOString().split("T")[0];

    let todayHoursStudied = 0;
    sessions.forEach(function (session) {
        if (session.date === today) {
            todayHoursStudied += Number(session.duration);
        }
    });

    achievements.forEach(function (achievement) {

        let unlocked = false;

        if (achievement.id === "first-session") {
            unlocked = sessions.length >= 1;
        }

        if (achievement.id === "ten-sessions") {
            unlocked = sessions.length >= 10;
        }

        if (achievement.id === "ten-hours") {
            unlocked = totalHoursAll >= 10;
        }

        if (achievement.id === "fifty-hours") {
            unlocked = totalHoursAll >= 50;
        }

        if (achievement.id === "three-day-streak") {
            unlocked = currentStreak >= 3;
        }

        if (achievement.id === "goal-crusher") {
            unlocked = todayHoursStudied >= savedGoal;
        }

        const card = document.createElement("div");

        card.className = "achievement-card " + (unlocked ? "unlocked" : "locked");

        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <strong>${unlocked ? "Unlocked ✅" : "🔒 Locked"}</strong>
        `;
        achievementsContainer.appendChild(card);
    });
}

function sanitizeForCSV(text) {
    return String(text).replace(/,/g, ";").replace(/\n/g, " ").trim();
}

function exportToCSV() {
    if (sessions.length === 0) {
        alert("There's nothing to export yet — add a session first.");
        return;
    }

    let csv = "Subject,Topic,Duration (hours),Date,Notes\n";
    sessions.forEach(function (session) {
        csv += `${sanitizeForCSV(session.subject)},${sanitizeForCSV(session.topic)},${session.duration},${session.date},${sanitizeForCSV(session.notes || "")}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "studyTrackerSessions.csv";
    link.click();
    URL.revokeObjectURL(url);
}

function backupToJSON() {
    if (sessions.length === 0) {
        alert("There's nothing to back up yet — add a session first.");
        return;
    }

    const backupData = {
        sessions: sessions,
        dailyGoal: savedGoal,
        weeklyGoal: savedWeeklyGoal,
        theme: localStorage.getItem("theme") || "light"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "studyTrackerBackup.json";
    link.click();
    URL.revokeObjectURL(url);
}

function restoreFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            sessions = data.sessions || [];
            savedGoal = data.dailyGoal || 4;
            savedWeeklyGoal = data.weeklyGoal || 28;

            localStorage.setItem("studySessions", JSON.stringify(sessions));
            localStorage.setItem("dailyGoal", savedGoal);
            localStorage.setItem("weeklyGoal", savedWeeklyGoal);

            if (data.theme) {
                localStorage.setItem("theme", data.theme);
                document.body.classList.toggle("dark-mode", data.theme === "dark");
                themeToggle.textContent = data.theme === "dark" ? "☀️" : "🌙";
            }

            dailyGoal.value = savedGoal;
            weeklyGoalInput.value = savedWeeklyGoal;

            refreshAll();

            alert("Your data is back! Everything's been restored.");
        }
        catch (error) {
            console.error("Error parsing JSON file:", error);
            alert("That file didn't look right — nothing was restored.");
        }
    };
    reader.readAsText(file);
}

exportCSVButton.addEventListener("click", exportToCSV);
backupJSONButton.addEventListener("click", backupToJSON);
restoreJSONInput.addEventListener("change", restoreFromJSON);

if (clearDataButton) {
    clearDataButton.addEventListener("click", function () {
        const confirmClear = confirm("This deletes every study session you've logged, for good. Are you sure you want to do this?");
        if (!confirmClear) return;

        sessions = [];
        saveSessions();
        refreshAll();
        alert("All cleared. Fresh start!");
    });
}


function updateActivityCalendar() {
    const activityCalendar = document.getElementById("activity-calendar");

    if (!activityCalendar) {
        return;
    }
    activityCalendar.innerHTML = "";

    const studyByDate = {};
    sessions.forEach(function (session) {
        studyByDate[session.date] = (studyByDate[session.date] || 0) + Number(session.duration);
    });

    const today = new Date();
    for (let i = 55; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        const hoursStudied = studyByDate[dateString] || 0;

        let level = 0;
        if (hoursStudied === 0) level = 0;
        else if (hoursStudied < 1) level = 1;
        else if (hoursStudied < 2) level = 2;
        else if (hoursStudied < 3) level = 3;
        else level = 4;

        const day = document.createElement("div");
        day.classList.add("activity-day", `level-${level}`);
        day.title = `${dateString}: ${hoursStudied.toFixed(1)} hours studied`;
        activityCalendar.appendChild(day);
    }
}

function updateInsights() {
    const bestSubjectEl = document.getElementById("insight-best-subject");
    const bestDayEl = document.getElementById("insight-best-day");
    const avgLengthEl = document.getElementById("insight-avg-length");
    const weekSessionsEl = document.getElementById("insight-week-sessions");

    if (!bestSubjectEl) return;

    if (sessions.length === 0) {
        bestSubjectEl.textContent = "Log a session to see this";
        bestDayEl.textContent = "Log a session to see this";
        avgLengthEl.textContent = "–";
        weekSessionsEl.textContent = "0";
        return;
    }

    const subjectTotal = {};
    sessions.forEach(function (s) {
        subjectTotal[s.subject] = (subjectTotal[s.subject] || 0) + Number(s.duration);
    });
    const bestSubject = Object.entries(subjectTotal).sort((a, b) => b[1] - a[1])[0];
    bestSubjectEl.textContent = `${bestSubject[0]} (${bestSubject[1].toFixed(1)}h)`;

    const dayTotal = {};
    sessions.forEach(function (s) {
        const dayName = new Date(s.date).toLocaleDateString("en-US", { weekday: "long" });
        dayTotal[dayName] = (dayTotal[dayName] || 0) + Number(s.duration);
    });
    const bestDay = Object.entries(dayTotal).sort((a, b) => b[1] - a[1])[0];
    bestDayEl.textContent = `${bestDay[0]} (${bestDay[1].toFixed(1)}h total)`;

    const avgLength = sessions.reduce((sum, s) => sum + Number(s.duration), 0) / sessions.length;
    avgLengthEl.textContent = `${avgLength.toFixed(1)} hours`;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const weekCount = sessions.filter(s => new Date(s.date) >= sevenDaysAgo).length;
    weekSessionsEl.textContent = weekCount;
}

function updateDailyQuote() {
    const quoteEl = document.getElementById("daily-quote");
    if (!quoteEl) return;

    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((new Date() - startOfYear) / 86400000);
    quoteEl.textContent = `"${studyQuotes[dayOfYear % studyQuotes.length]}"`;
}

function formatTimer(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    if (!timerDisplay) return;
    timerDisplay.textContent = formatTimer(timerDuration);
}

function startTimer() {
    if (!timerDisplay || timerRunning) return;

    timerRunning = true;
    if (timerStatus) timerStatus.textContent = "Studying... Stay focused! 🔥";

    timerInterval = setInterval(function () {
        timerDuration--;
        updateTimerDisplay();

        if (timerDuration <= 0) {
            finishTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerRunning) return;

    clearInterval(timerInterval);
    timerRunning = false;
    if (timerStatus) timerStatus.textContent = "Timer paused. Take a short break! ⏸️";
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerDuration = lastTimerMinutes * 60;
    updateTimerDisplay();
    if (timerStatus) timerStatus.textContent = "Timer reset. Ready to start again! 🔄";
}

function finishTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerDuration = 0;
    updateTimerDisplay();
    if (timerStatus) timerStatus.textContent = "Time's up! Great job! 🎉";
    alert("Time's up! Great job! 🎉");

    const shouldLog = confirm(`Want to log this ${lastTimerMinutes}-minute block as a study session?`);
    if (!shouldLog) return;

    const subject = prompt("What subject was this for?", "");
    if (!subject || subject.trim() === "") return;

    const topic = prompt("What did you work on?", "") || "Focused study session";

    const session = {
        subject: subject.trim(),
        topic: topic.trim() || "Focused study session",
        duration: Number((lastTimerMinutes / 60).toFixed(2)),
        date: new Date().toISOString().split("T")[0],
        notes: "Logged automatically from the study timer"
    };

    sessions.push(session);
    saveSessions();
    refreshAll();
}

if (startButton) startButton.addEventListener("click", startTimer);
if (pauseButton) pauseButton.addEventListener("click", pauseTimer);
if (resetButton) resetButton.addEventListener("click", resetTimer);

timerModeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        clearInterval(timerInterval);
        timerRunning = false;

        timerModeButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const minutes = Number(button.getAttribute("data-minutes"));
        lastTimerMinutes = minutes;
        timerDuration = minutes * 60;
        updateTimerDisplay();
        if (timerStatus) timerStatus.textContent = "Ready to study 📚";
    });
});

if (setCustomDurationButton) {
    setCustomDurationButton.addEventListener("click", function () {
        const minutes = Number(customDurationInput.value);
        if (minutes < 1 || minutes > 180) {
            alert("Please enter a duration between 1 and 180 minutes.");
            return;
        }
        clearInterval(timerInterval);
        timerRunning = false;

        timerModeButtons.forEach(btn => btn.classList.remove("active"));

        lastTimerMinutes = minutes;
        timerDuration = minutes * 60;
        updateTimerDisplay();
        if (timerStatus) timerStatus.textContent = `Custom duration set to ${minutes} minutes. Ready to start! ⏱️`;
    });
}


const wizardCursor = document.getElementById("wizard-cursor");

if (wizardCursor && !("ontouchstart" in window)) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let wizardX = mouseX;
    let wizardY = mouseY;

    document.addEventListener("mousemove", function (event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    function animateWizard() {
        // Gentle easing so the wizard trails behind the cursor instead of snapping to it
        wizardX += (mouseX - wizardX) * 0.15;
        wizardY += (mouseY - wizardY) * 0.15;

        wizardCursor.style.transform = `translate(${wizardX - 15}px, ${wizardY - 15}px)`;

        requestAnimationFrame(animateWizard);
    }

    animateWizard();
}


const aiToggle = document.getElementById("ai-toggle");
const aiPanel = document.getElementById("ai-panel");
const aiClose = document.getElementById("ai-close");
const aiMessages = document.getElementById("ai-messages");
const aiForm = document.getElementById("ai-form");
const aiInput = document.getElementById("ai-input");
const aiChips = document.querySelectorAll(".ai-chip");

function addAiMessage(text, sender) {
    if (!aiMessages) return;
    const bubble = document.createElement("div");
    bubble.className = "ai-message " + sender;
    bubble.textContent = text;
    aiMessages.appendChild(bubble);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

function greetIfEmpty() {
    if (aiMessages && aiMessages.children.length === 0) {
        addAiMessage(
            "Hey! I'm your Study Buddy. Ask me things like \"how many hours this week\" or \"what's my best subject\" — or just tap a suggestion below.",
            "bot"
        );
    }
}

if (aiToggle && aiPanel) {
    aiToggle.addEventListener("click", function () {
        aiPanel.classList.toggle("hidden");
        if (!aiPanel.classList.contains("hidden")) {
            greetIfEmpty();
            if (aiInput) aiInput.focus();
        }
    });
}

if (aiClose && aiPanel) {
    aiClose.addEventListener("click", function () {
        aiPanel.classList.add("hidden");
    });
}

function answerStudyQuestion(question) {
    const q = question.toLowerCase();

    if (sessions.length === 0 && !q.includes("tip") && !q.includes("advice") && !q.includes("hello") && !q.includes("hi") && !q.includes("hey")) {
        return "You haven't logged any sessions yet — add your first one and I'll be able to tell you a lot more about your progress.";
    }

    const today = new Date().toISOString().split("T")[0];
    let todayHoursStudied = 0;
    sessions.forEach(s => { if (s.date === today) todayHoursStudied += Number(s.duration); });

    let totalHoursAll = 0;
    sessions.forEach(s => { totalHoursAll += Number(s.duration); });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    let weekHours = 0;
    let weekSessions = 0;
    sessions.forEach(function (s) {
        const d = new Date(s.date);
        if (d >= sevenDaysAgo) {
            weekHours += Number(s.duration);
            weekSessions++;
        }
    });

    if (q.includes("week")) {
        const percent = Math.min(100, Math.round((weekHours / savedWeeklyGoal) * 100));
        return `You've studied ${weekHours.toFixed(1)} hours across ${weekSessions} session(s) in the last 7 days — about ${percent}% of your ${savedWeeklyGoal}-hour weekly target.`;
    }

    if (q.includes("today")) {
        if (todayHoursStudied >= savedGoal) {
            return `You've already studied ${todayHoursStudied.toFixed(1)} hours today, past your ${savedGoal}-hour goal. Nice work.`;
        }
        return `You've studied ${todayHoursStudied.toFixed(1)} hours today. That leaves about ${(savedGoal - todayHoursStudied).toFixed(1)} hours to reach your daily goal.`;
    }

    if (q.includes("track") || q.includes("goal")) {
        return todayHoursStudied >= savedGoal
            ? `Yes — you've hit ${todayHoursStudied.toFixed(1)} of your ${savedGoal}-hour goal today. 🎉`
            : `Not quite yet. You're at ${todayHoursStudied.toFixed(1)} of ${savedGoal} hours today, so about ${(savedGoal - todayHoursStudied).toFixed(1)} hours left.`;
    }

    if (q.includes("strong") || q.includes("subject") || q.includes("best")) {
        const subjectTotal = {};
        sessions.forEach(s => { subjectTotal[s.subject] = (subjectTotal[s.subject] || 0) + Number(s.duration); });
        const sorted = Object.entries(subjectTotal).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) return "I don't have enough data on your subjects yet.";
        return `Your strongest subject so far is ${sorted[0][0]}, with ${sorted[0][1].toFixed(1)} total hours logged.`;
    }

    if (q.includes("streak")) {
        const streak = streakCount.textContent;
        return streak === "0"
            ? "You don't have an active streak right now — log a session today to get one going."
            : `You're on a ${streak}-day streak. Keep it alive!`;
    }

    if (q.includes("total")) {
        return `You've studied ${totalHoursAll.toFixed(1)} hours in total across ${sessions.length} session(s). That adds up faster than it feels like day to day.`;
    }

    if (q.includes("tip") || q.includes("advice") || q.includes("motivat")) {
        return studyTips[Math.floor(Math.random() * studyTips.length)];
    }

    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        return "Hey there! Ask me about your hours, streak, best subject — or just say \"tip\" if you want some study advice.";
    }

    return "I'm not sure how to answer that one yet — try asking about your weekly hours, today's progress, your streak, or your strongest subject.";
}

function handleAiQuestion(question) {
    addAiMessage(question, "user");
    const response = answerStudyQuestion(question);
    setTimeout(() => addAiMessage(response, "bot"), 300);
}

if (aiForm) {
    aiForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const question = aiInput.value.trim();
        if (question === "") return;
        handleAiQuestion(question);
        aiInput.value = "";
    });
}

aiChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
        const question = chip.getAttribute("data-question");
        handleAiQuestion(question);
    });
});