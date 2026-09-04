// ================= Core elements =================

const studyForm = document.getElementById("study-form");
const sessionList = document.getElementById("session-list");
const totalHours = document.getElementById("total-hours");
const todayHours = document.getElementById("today-hours");
const sessionCount = document.getElementById("session-count");
const streakCount = document.getElementById("streak-count");

const flashcardForm = document.getElementById("flashcard-form");
const flashcardFilterSelect = document.getElementById("flashcard-filter");
const flashcardListEl = document.getElementById("flashcard-list");
const startReviewButton = document.getElementById("start-review");
const reviewArea = document.getElementById("review-area");
const reviewCardEl = document.getElementById("review-card");
const reviewCardText = document.getElementById("review-card-text");
const reviewProgressEl = document.getElementById("review-progress");
const reviewKnowButton = document.getElementById("review-know");
const reviewPracticeButton = document.getElementById("review-practice");
const endReviewButton = document.getElementById("end-review");

const studyDate = document.getElementById("study-date");
const notesInput = document.getElementById("notes");
const dailyGoal = document.getElementById("daily-goal");
const savedGoalButton = document.getElementById("save-goal");
const goalStatus = document.getElementById("goal-status");
const goalRingProgress = document.getElementById("goal-ring-progress");
const goalRingPercent = document.getElementById("goal-ring-percent");
const goalRingText = document.getElementById("goal-ring-text");
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

// ================= Checklist elements =================

const checklistForm = document.getElementById("checklist-form");
const checklistInput = document.getElementById("checklist-input");
const checklistListEl = document.getElementById("checklist-list");
const checklistProgressEl = document.getElementById("checklist-progress");


// ================= Planner & reminders =================

const planForm = document.getElementById("plan-form");
const planListEl = document.getElementById("plan-list");
const remindersToggle = document.getElementById("reminders-enabled");

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

const GOAL_RING_CIRCUMFERENCE = 2 * Math.PI * 52;

// ================= Advanced Analytics =================

const averageSessionEl = document.getElementById("average-session");
const bestSubjectEl = document.getElementById("best-subject");
const bestStreakEl = document.getElementById("best-streak");
const goalCompletionEl = document.getElementById("goal-completion");

// ================= XP System =================

const userLevelEl = document.getElementById("user-level");
const userXpEl = document.getElementById("user-xp");
const xpProgressTextEl = document.getElementById("xp-progress-text");
const xpProgressFillEl = document.getElementById("xp-progress-fill");

let userXP = Number(localStorage.getItem("userXP")) || 0;

function awardXP(amount, reason = "") {
    const oldLevel = Math.floor(userXP / 500) + 1;
    userXP += amount;
    localStorage.setItem("userXP", userXP);

    updateXPDisplay();
    
    const newLevel = Math.floor(userXP / 500) + 1;
    if (newLevel > oldLevel) {
        showToast(`🎉 Level Up! You reached Level ${newLevel}!`);

        launchConfetti();
    }else if (reason) {
        showToast(`⭐ +${amount} XP ${reason}`);
    }
}

// ================= State =================

let sessions = JSON.parse(localStorage.getItem("studySessions")) || [];
let savedGoal = Number(localStorage.getItem("dailyGoal")) || 4;
let savedWeeklyGoal = Number(localStorage.getItem("weeklyGoal")) || 28;

let timerDuration = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let lastTimerMinutes = 25;

let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
let checklist = JSON.parse(localStorage.getItem("revisionChecklist")) || [];
let plannedSessions = JSON.parse(localStorage.getItem("plannedSessions")) || [];
let remindersEnabled = localStorage.getItem("remindersEnabled") === "true";


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
    "Try the Pomodoro technique — 25 minutes of focused work, then a 5-minute break. It's built right into the timer.",
    "Studying the same material at increasing intervals (spaced repetition) beats cramming almost every time.",
    "Teaching a concept out loud, even to an empty room, is one of the fastest ways to find the gaps in your understanding.",
    "A short walk before a study session can improve focus more than an extra cup of coffee.",
    "Switching subjects partway through a session (interleaving) tends to help long-term retention more than sticking to one topic for hours.",
    "Put your phone in another room. It sounds obvious, but it's still the single biggest lever most people have.",
    "Write down what you expect to struggle with before you start — it primes your brain to notice it faster."
];

let subjectChart = null;
let weeklyChart = null;


// ================= Tabs =================

const navTabs = document.querySelectorAll(".nav-tab");
const tabPanels = document.querySelectorAll(".tab-panel");

navTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        const target = tab.getAttribute("data-tab");

        navTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        tabPanels.forEach(function (panel) {
            panel.classList.toggle("active", panel.id === "tab-" + target);
        });
    });
});


// ================= Init =================

studyDate.value = new Date().toISOString().split("T")[0];
dailyGoal.value = savedGoal;
weeklyGoalInput.value = savedWeeklyGoal;

refreshAll();
updateTimerDisplay();
updateDailyQuote();
populateFlashcardFilter();
displayFlashcards();
displayChecklist();
displayPlans();
checkPlanReminders();
setInterval(checkPlanReminders, 30000);


// ================= Study sessions =================

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

    sessions.push({ subject, topic, duration, date: selectDate, notes });

    const earnedXP = Math.max(5,
        Math.round(Number(duration) * 10)
    );

    awardXP(earnedXP,"for studying");

    saveSessions();
    refreshAll();

    studyForm.reset();
    studyDate.value = new Date().toISOString().split("T")[0];
});

function saveSessions() {
    localStorage.setItem("studySessions", JSON.stringify(sessions));
}

// Everything that needs to re-run whenever the sessions list changes
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
    updateAdvancedAnalytics();
    updateXPDisplay();
    updateXPBadge();
}


// ---- Session list: search, filter, sort ----

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
        return b.session.date.localeCompare(a.session.date);
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
        sessionList.innerHTML = "<p>No study sessions recorded yet. Add your first one in the Log tab!</p>";
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
    if (subjectChart) subjectChart.destroy();

    const subjectTotal = {};
    sessions.forEach(function (session) {
        subjectTotal[session.subject] = (subjectTotal[session.subject] || 0) + session.duration;
    });

    const subjects = Object.keys(subjectTotal);
    const studyHoursData = Object.values(subjectTotal);

    if (subjects.length === 0) return;

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
    if (!confirm("Delete this session? There's no undo for this one.")) return;

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
        if (difference === 1) streak++;
        else break;
    }
    streakCount.textContent = streak;
}

function updateWeeklyChart() {
    const weeklyCanvas = document.getElementById("weekly-chart");
    if (!weeklyCanvas) return;
    if (weeklyChart) weeklyChart.destroy();

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

        labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));

        let hours = 0;
        sessions.forEach(function (session) {
            if (session.date === dateString) hours += Number(session.duration);
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


// ================= Goals =================

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
        if (session.date === today) todayHoursStudied += Number(session.duration);
    });

    const progress = Math.min((todayHoursStudied / savedGoal) * 100, 100);

    if (goalRingProgress) {
        goalRingProgress.style.strokeDasharray = `${GOAL_RING_CIRCUMFERENCE}`;
        goalRingProgress.style.strokeDashoffset = `${GOAL_RING_CIRCUMFERENCE * (1 - progress / 100)}`;
    }
    if (goalRingPercent) goalRingPercent.textContent = `${Math.round(progress)}%`;
    if (goalRingText) goalRingText.textContent = `${todayHoursStudied.toFixed(1)} / ${savedGoal.toFixed(1)} hrs`;

    if (todayHoursStudied >= savedGoal) {
        goalStatus.textContent = "🎉 Daily goal completed!";

        const todayStr = today;
        if (localStorage.getItem("goalCelebratedDate") !== todayStr) {
            launchConfetti();
            localStorage.setItem("goalCelebratedDate", todayStr);
        }
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


// ================= Theme =================

const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-mode");

        if (themeToggle) {
            themeToggle.textContent = "☀️";
        }
    } else {
        document.body.classList.remove("dark-mode");

        if (themeToggle) {
            themeToggle.textContent = "🌙";
        }
    }
}

const savedTheme = localStorage.getItem("theme") || "light";

applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", function () {

        const isDark = document.body.classList.contains("dark-mode");

        const newTheme = isDark ? "light" : "dark";

        localStorage.setItem("theme", newTheme);

        applyTheme(newTheme);
    });
}


// ================= Achievements =================

function updateAchievements() {
    achievementsContainer.innerHTML = "";

    let totalHoursAll = 0;
    sessions.forEach(s => { totalHoursAll += Number(s.duration); });

    let currentStreak = 0;
    if (sessions.length > 0) currentStreak = Number(streakCount.textContent);

    const today = new Date().toISOString().split("T")[0];
    let todayHoursStudied = 0;
    sessions.forEach(s => { if (s.date === today) todayHoursStudied += Number(s.duration); });

    const previouslyUnlocked = JSON.parse(localStorage.getItem("unlockedAchievements")) || [];
    const nowUnlocked = [];

    achievements.forEach(function (achievement) {
        let unlocked = false;

        if (achievement.id === "first-session") unlocked = sessions.length >= 1;
        if (achievement.id === "ten-sessions") unlocked = sessions.length >= 10;
        if (achievement.id === "ten-hours") unlocked = totalHoursAll >= 10;
        if (achievement.id === "fifty-hours") unlocked = totalHoursAll >= 50;
        if (achievement.id === "three-day-streak") unlocked = currentStreak >= 3;
        if (achievement.id === "goal-crusher") unlocked = todayHoursStudied >= savedGoal;

        if (unlocked) {
            nowUnlocked.push(achievement.id);
            if (!previouslyUnlocked.includes(achievement.id)) {
                launchConfetti();
            }
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

    localStorage.setItem("unlockedAchievements", JSON.stringify(nowUnlocked));
}


// ================= Backup / export / clear =================

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
        theme: localStorage.getItem("theme") || "light",
        flashcards: flashcards,
        revisionChecklist: checklist,
        plannedSessions: plannedSessions
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
            flashcards = data.flashcards || [];
            checklist = data.revisionChecklist || [];
            plannedSessions = data.plannedSessions || [];

            localStorage.setItem("studySessions", JSON.stringify(sessions));
            localStorage.setItem("dailyGoal", savedGoal);
            localStorage.setItem("weeklyGoal", savedWeeklyGoal);
            localStorage.setItem("flashcards", JSON.stringify(flashcards));
            localStorage.setItem("revisionChecklist", JSON.stringify(checklist));
            localStorage.setItem("plannedSessions", JSON.stringify(plannedSessions));

            if (data.theme) {
                localStorage.setItem("theme", data.theme);
                document.body.classList.toggle("dark-mode", data.theme === "dark");
                themeToggle.textContent = data.theme === "dark" ? "☀️" : "🌙";
            }

            dailyGoal.value = savedGoal;
            weeklyGoalInput.value = savedWeeklyGoal;

            refreshAll();
            displayFlashcards();
            populateFlashcardFilter();
            displayChecklist();
            displayPlans();

            alert("Your data is back! Everything's been restored.");
        } catch (error) {
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
        if (!confirm("This deletes every study session you've logged, for good. Are you sure?")) return;
        sessions = [];
        saveSessions();
        refreshAll();
        alert("All cleared. Fresh start!");
    });
}


// ================= Activity calendar =================

function updateActivityCalendar() {
    const activityCalendar = document.getElementById("activity-calendar");
    if (!activityCalendar) return;
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


// ================= Insights =================

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
    sessions.forEach(s => { subjectTotal[s.subject] = (subjectTotal[s.subject] || 0) + Number(s.duration); });
    const bestSubject = Object.entries(subjectTotal).sort((a, b) => b[1] - a[1])[0];
    bestSubjectEl.textContent = `${bestSubject[0]} (${bestSubject[1].toFixed(1)}h)`;

    const dayTotal = {};
    sessions.forEach(s => {
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


// ================= Daily quote =================

function updateDailyQuote() {
    const quoteEl = document.getElementById("daily-quote");
    if (!quoteEl) return;
    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((new Date() - startOfYear) / 86400000);
    quoteEl.textContent = `"${studyQuotes[dayOfYear % studyQuotes.length]}"`;
}


// ================= Study Timer =================

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
        if (timerDuration <= 0) finishTimer();
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

    sessions.push({
        subject: subject.trim(),
        topic: topic.trim() || "Focused study session",
        duration: Number((lastTimerMinutes / 60).toFixed(2)),
        date: new Date().toISOString().split("T")[0],
        notes: "Logged automatically from the study timer"
    });

    const earnedXP = Math.max(5, Math.round(lastTimerMinutes/6));

    awardXP(earnedXP, "for completing a study timer");

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


let reviewQueue = [];
let reviewIndex = 0;
let reviewShowingBack = false;
let reviewKnownCount = 0;

function saveFlashcards() {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
}

if (flashcardForm) {
    flashcardForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const subject = document.getElementById("flashcard-subject").value.trim();
        const front = document.getElementById("flashcard-front").value.trim();
        const back = document.getElementById("flashcard-back").value.trim();

        if (!subject || !front || !back) {
            alert("Please fill in the subject and both sides of the card.");
            return;
        }

        flashcards.push({ id: Date.now(), subject, front, back });
        saveFlashcards();
        displayFlashcards();
        populateFlashcardFilter();
        flashcardForm.reset();
    });
}

function populateFlashcardFilter() {
    if (!flashcardFilterSelect) return;
    const currentValue = flashcardFilterSelect.value;
    const subjects = [...new Set(flashcards.map(c => c.subject))];

    flashcardFilterSelect.innerHTML = '<option value="all">All Subjects</option>';
    subjects.forEach(function (subject) {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        flashcardFilterSelect.appendChild(option);
    });

    if (subjects.includes(currentValue)) flashcardFilterSelect.value = currentValue;
}

function displayFlashcards() {
    if (!flashcardListEl) return;
    const filterValue = flashcardFilterSelect ? flashcardFilterSelect.value : "all";
    const filtered = filterValue === "all" ? flashcards : flashcards.filter(c => c.subject === filterValue);

    flashcardListEl.innerHTML = "";

    if (filtered.length === 0) {
        flashcardListEl.innerHTML = "<p>No flashcards yet — add one above.</p>";
        return;
    }

    filtered.forEach(function (card) {
        const item = document.createElement("div");
        item.className = "flashcard-item";
        item.innerHTML = `
            <div><strong>${card.subject}</strong><p>${card.front}</p></div>
            <button class="delete-btn" onclick="deleteFlashcard(${card.id})">Delete</button>
        `;
        flashcardListEl.appendChild(item);
    });
}

function deleteFlashcard(id) {
    flashcards = flashcards.filter(c => c.id !== id);
    saveFlashcards();
    displayFlashcards();
    populateFlashcardFilter();
}

if (flashcardFilterSelect) {
    flashcardFilterSelect.addEventListener("change", displayFlashcards);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function startReview() {
    const filterValue = flashcardFilterSelect ? flashcardFilterSelect.value : "all";
    reviewQueue = (filterValue === "all" ? flashcards : flashcards.filter(c => c.subject === filterValue)).slice();

    if (reviewQueue.length === 0) {
        alert("Add some flashcards first!");
        return;
    }

    shuffleArray(reviewQueue);
    reviewIndex = 0;
    reviewKnownCount = 0;
    reviewArea.classList.remove("hidden");
    showReviewCard();
}

function showReviewCard() {
    reviewShowingBack = false;
    const card = reviewQueue[reviewIndex];
    reviewCardText.textContent = card.front;
    reviewProgressEl.textContent = `Card ${reviewIndex + 1} of ${reviewQueue.length}`;
}

if (reviewCardEl) {
    reviewCardEl.addEventListener("click", function () {
        const card = reviewQueue[reviewIndex];
        reviewShowingBack = !reviewShowingBack;
        reviewCardText.textContent = reviewShowingBack ? card.back : card.front;
    });
}

function nextReviewCard(known) {
    if (known) reviewKnownCount++;
    reviewIndex++;

    if (reviewIndex >= reviewQueue.length) {
        alert(`Review done! You knew ${reviewKnownCount} of ${reviewQueue.length} cards.`);
        reviewArea.classList.add("hidden");
        return;
    }
    showReviewCard();
}

if (reviewKnowButton) reviewKnowButton.addEventListener("click", () => nextReviewCard(true));
if (reviewPracticeButton) reviewPracticeButton.addEventListener("click", () => nextReviewCard(false));
if (endReviewButton) endReviewButton.addEventListener("click", () => reviewArea.classList.add("hidden"));
if (startReviewButton) startReviewButton.addEventListener("click", startReview);


function saveChecklist() {
    localStorage.setItem("revisionChecklist", JSON.stringify(checklist));
}

if (checklistForm) {
    checklistForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const subject = document.getElementById("checklist-subject").value.trim();
        const item = document.getElementById("checklist-item").value.trim();

        if (!subject || !item) {
            alert("Add both a subject and what you need to revise.");
            return;
        }

        checklist.push({ id: Date.now(), subject, item, done: false });
        saveChecklist();
        displayChecklist();
        checklistForm.reset();
    });
}

function displayChecklist() {
    if (!checklistListEl) return;
    checklistListEl.innerHTML = "";

    if (checklist.length === 0) {
        checklistListEl.innerHTML = "<p>Nothing on your revision list yet.</p>";
        if (checklistProgressEl) checklistProgressEl.textContent = "";
        return;
    }

    checklist.forEach(function (entry) {
        const row = document.createElement("div");
        row.className = "checklist-item" + (entry.done ? " done" : "");
        row.innerHTML = `
            <label>
                <input type="checkbox" ${entry.done ? "checked" : ""} onchange="toggleChecklistItem(${entry.id})">
                <span><strong>${entry.subject}:</strong> ${entry.item}</span>
            </label>
            <button class="delete-btn" onclick="deleteChecklistItem(${entry.id})">Delete</button>
        `;
        checklistListEl.appendChild(row);
    });

    const doneCount = checklist.filter(c => c.done).length;
    if (checklistProgressEl) checklistProgressEl.textContent = `${doneCount} of ${checklist.length} done`;
}

function toggleChecklistItem(id) {
    const entry = checklist.find(c => c.id === id);
    if (entry) entry.done = !entry.done;
    saveChecklist();
    displayChecklist();
}

function deleteChecklistItem(id) {
    checklist = checklist.filter(c => c.id !== id);
    saveChecklist();
    displayChecklist();
}


if (remindersToggle) {
    remindersToggle.checked = remindersEnabled;
    remindersToggle.addEventListener("change", function () {
        remindersEnabled = remindersToggle.checked;
        localStorage.setItem("remindersEnabled", remindersEnabled);

        if (remindersEnabled && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    });
}

function savePlans() {
    localStorage.setItem("plannedSessions", JSON.stringify(plannedSessions));
}

if (planForm) {
    planForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const subject = document.getElementById("plan-subject").value;
        const topic = document.getElementById("plan-topic").value.trim();
        const date = document.getElementById("plan-date").value;
        const time = document.getElementById("plan-time").value;

        if (!subject || !topic || !date) {
            alert("Add a subject, a topic, and a date.");
            return;
        }

        plannedSessions.push({ id: Date.now(), subject, topic, date, time, notified: false });
        savePlans();
        displayPlans();
        planForm.reset();
    });
}

function displayPlans() {
    if (!planListEl) return;
    planListEl.innerHTML = "";

    if (plannedSessions.length === 0) {
        planListEl.innerHTML = "<p>No sessions planned yet — add one above.</p>";
        return;
    }

    const sorted = plannedSessions.slice().sort(function (a, b) {
        return (a.date + (a.time || "00:00")).localeCompare(b.date + (b.time || "00:00"));
    });

    sorted.forEach(function (plan) {
        const item = document.createElement("div");
        item.className = "plan-item";
        item.innerHTML = `
            <div>
                <strong>${plan.subject}</strong> — ${plan.topic}
                <br><small>${plan.date}${plan.time ? " at " + plan.time : ""}</small>
            </div>
            <div>
                <button onclick="markPlanDone(${plan.id})">✅ Done</button>
                <button class="delete-btn" onclick="deletePlan(${plan.id})">Delete</button>
            </div>
        `;
        planListEl.appendChild(item);
    });
}

function markPlanDone(id) {
    const plan = plannedSessions.find(p => p.id === id);
    if (!plan) return;

    const durationInput = prompt(`How many hours did you spend on "${plan.topic}"?`, "1");
    if (durationInput === null) return;

    const duration = Number(durationInput);
    if (duration <= 0) {
        alert("That doesn't look like a valid number of hours.");
        return;
    }

    sessions.push({
        subject: plan.subject,
        topic: plan.topic,
        duration: duration,
        date: new Date().toISOString().split("T")[0],
        notes: "Completed from the planner"
    });

    const earnedXP = Math.max(5, Math.round(duration * 10));

    awardXP(earnedXP, "for completing a planned session");

    saveSessions();
    plannedSessions = plannedSessions.filter(p => p.id !== id);
    savePlans();
    refreshAll();
    displayPlans();
}

function deletePlan(id) {
    plannedSessions = plannedSessions.filter(p => p.id !== id);
    savePlans();
    displayPlans();
}

function checkPlanReminders() {
    if (!remindersEnabled) return;

    const now = new Date();
    const nowDateStr = now.toISOString().split("T")[0];
    const nowTimeStr = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

    let changed = false;
    plannedSessions.forEach(function (plan) {
        if (plan.notified || !plan.time) return;
        if (plan.date === nowDateStr && plan.time <= nowTimeStr) {
            showToast(`⏰ Time to study ${plan.subject}: ${plan.topic}`);
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Study Tracker", { body: `${plan.subject}: ${plan.topic}` });
            }
            plan.notified = true;
            changed = true;
        }
    });

    if (changed) savePlans();
}


// ================= Toasts =================

function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) {
        alert(message);
        return;
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("toast-hide");
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}


// ================= Confetti =================

function launchConfetti() {
    const container = document.getElementById("confetti-container");
    if (!container) return;

    const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

    for (let i = 0; i < 40; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2 + Math.random() * 1.5) + "s";
        piece.style.animationDelay = (Math.random() * 0.3) + "s";
        container.appendChild(piece);

        setTimeout(() => piece.remove(), 4000);
    }
}


// ================= Wizard cursor buddy =================

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
        wizardX += (mouseX - wizardX) * 0.12;
        wizardY += (mouseY - wizardY) * 0.12;
        
        wizardCursor.style.transform = 
            `translate3d(${wizardX}px, ${wizardY}px, 0) translate(-50%, -50%)`;
        
        requestAnimationFrame(animateWizard);
    }
    animateWizard();
}


// ================= Study Buddy assistant =================

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
            "Hey! I'm your Study Buddy. Ask me things like \"how many hours this week\" or \"what's next on my planner\" — or tap a suggestion below.",
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

    if (q.includes("plan") || q.includes("next") || q.includes("schedule")) {
        if (plannedSessions.length === 0) {
            return "You don't have anything planned yet — add a session in the Planner tab.";
        }
        const sorted = plannedSessions.slice().sort((a, b) => (a.date + (a.time || "00:00")).localeCompare(b.date + (b.time || "00:00")));
        const next = sorted[0];
        return `Next up: ${next.subject} — ${next.topic}, on ${next.date}${next.time ? " at " + next.time : ""}. You've got ${plannedSessions.length} session(s) planned in total.`;
    }

    if (q.includes("flashcard")) {
        return flashcards.length === 0
            ? "You haven't added any flashcards yet — try the Study Tools tab."
            : `You've got ${flashcards.length} flashcard(s) saved. Head to Study Tools to start a review.`;
    }

    if (q.includes("checklist") || q.includes("revis")) {
        if (checklist.length === 0) return "Your revision checklist is empty right now.";
        const doneCount = checklist.filter(c => c.done).length;
        return `You've checked off ${doneCount} of ${checklist.length} items on your revision list.`;
    }

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
        if (d >= sevenDaysAgo) { weekHours += Number(s.duration); weekSessions++; }
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
        return "Hey there! Ask me about your hours, streak, best subject, your planner, or just say \"tip\" for study advice.";
    }

    return "I'm not sure how to answer that one yet — try asking about your weekly hours, today's progress, your streak, your planner, or your strongest subject.";
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
        handleAiQuestion(chip.getAttribute("data-question"));
    });
});

function updateAdvancedAnalytics() {

    // ---------- Average Session ----------

    if (sessions.length === 0) {
        averageSessionEl.textContent = "0 min";
    } else {
        const totalMinutes = sessions.reduce(
            (sum, session) => sum + Number(session.duration),
            0
        );

        const averageMinutes = totalMinutes / sessions.length;

        averageSessionEl.textContent =
            `${Math.round(averageMinutes)} min`;
    }


    // ---------- Best Subject ----------

    if (sessions.length === 0) {

        bestSubjectEl.textContent = "None";

    } else {

        const subjectTotals = {};

        sessions.forEach(session => {

            const subject = session.subject || "Other";

            if (!subjectTotals[subject]) {
                subjectTotals[subject] = 0;
            }

            subjectTotals[subject] += Number(session.duration);
        });

        let bestSubject = "";
        let highestTime = 0;

        Object.keys(subjectTotals).forEach(subject => {

            if (subjectTotals[subject] > highestTime) {
                highestTime = subjectTotals[subject];
                bestSubject = subject;
            }

        });

        bestSubjectEl.textContent = bestSubject || "None";
    }


    // ---------- Goal Completion ----------

    if (sessions.length === 0) {

        goalCompletionEl.textContent = "0%";

    } else {

        const completedDays = new Set();

        sessions.forEach(session => {

            const duration = Number(session.duration);

            if (duration >= savedGoal) {
                completedDays.add(session.date);
            }

        });

        const totalDays = new Set(
            sessions.map(session => session.date)
        ).size;

        const completion =
            totalDays === 0
                ? 0
                : (completedDays.size / totalDays) * 100;

        goalCompletionEl.textContent =
            `${Math.round(completion)}%`;
    }


    // ---------- Best Streak ----------

    calculateBestStreak();

}
function calculateBestStreak() {

    if (sessions.length === 0) {
        bestStreakEl.textContent = "0 days";
        return;
    }

    const dates = [
        ...new Set(
            sessions.map(session => session.date)
        )
    ].sort();

    let bestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {

        const previous = new Date(dates[i - 1]);
        const current = new Date(dates[i]);

        const difference =
            (current - previous) / (1000 * 60 * 60 * 24);

        if (difference === 1) {

            currentStreak++;

            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }

        } else {

            currentStreak = 1;

        }
    }

    bestStreakEl.textContent =
        `${bestStreak} day${bestStreak === 1 ? "" : "s"}`;
}


function updateXPDisplay() {
    const xpPerLevel = 500;
    const level = Math.floor(userXP / xpPerLevel) + 1;
    const currentLevelXP = userXP % xpPerLevel;

    const progressPercent =(currentLevelXP / xpPerLevel) * 100;

    userLevelEl.textContent = level;
    userXpEl.textContent = userXP;

    xpProgressTextEl.textContent = `${currentLevelXP} / ${xpPerLevel} XP`;
    xpProgressFillEl.style.width = `${progressPercent}%`;
}

function updateXPBadge() {
    const totalHours = sessions.reduce(
        (total, session) => total + Number(session.duration),0
    );

    const totalSessions = sessions.length;
    const currentLevel = Math.floor(userXP / 500) + 1;

    const badges = [
        {
            id: "first-step",
            icon: "🌱",
            name: "First Step",
            description: "Complete your first study session",
            unlocked: totalSessions >= 1   
        },
        {
            id: "getting-serious",
            icon: "📚",
            name: "Getting Serioud",
            description: "Complete 10 study sessions",
            unlocked: totalSessions >= 10
        },
        {
            id: "time-builder",
            icon: "⏱️",
            name: "Time Builder",
            description: "Study for 10 total hours",
            unlocked: totalHours >= 10
        },
        {
            id: "on-fire",
            icon: "🔥",
            name: "On Fire",
            description: "Reach a 7-day streak",
            unlocked: Number(streakCount.textContent) >= 7
        },
        {
            id: "knowledge-seeker",
            icon: "🧠",
            name: "Knowledge Seeker",
            description: "Complete 50 study sessions",
            unlocked: totalSessions >= 50
        },
         {
            id: "study-master",
            icon: "🏆",
            name: "Study Master",
            description: "Reach Level 10",
            unlocked: currentLevel >= 10
        }
    ];

    const badgeContainer = document.getElementById("xp-badges");

    if (!badgeContainer) return;

    badgeContainer.innerHTML = "";

    badges.forEach(badge => {
        const badgeElement = document.createElement("div");
        badgeElement.className = `xp-badge ${badge.unlocked ? "unlocked" : "locked"}`;

        badgeElement.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-description">
                ${badge.description}
            </div>
            <div class="badge-status">
                ${badge.unlocked ? "✅ Unlocked" : "🔒 Locked"}
            </div>
        `;

        badgeContainer.appendChild(badgeElement);
    })
}
// ================= PWA =================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function () {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(function () {
                console.log("Study Tracker PWA is ready!");
            })
            .catch(function (error) {
                console.error("Service Worker registration failed:", error);
            });

    });

}