const studyForm = document.getElementById("study-form");
const sessionList = document.getElementById("session-list");
const totalHours = document.getElementById("total-hours");
const todayHours = document.getElementById("today-hours");
const sessionCount = document.getElementById("session-count");
const streakCount = document.getElementById("streak-count");
const studyDate = document.getElementById("study-date");
const dailyGoal = document.getElementById("daily-goal");
const saveGoalButton = document.getElementById("save-goal");
const goalProgressBar = document.getElementById("goal-progress-bar");
const goalText = document.getElementById("goal-text");

let sessions = JSON.parse(
    localStorage.getItem("studySessions")
) || [];

let saveGoal = Number(
    localStorage.getItem("dailyGoal")
) || 4;

let subjectChart = null;
let weeklyChart = null;

studyDate.value = new Date().toISOString().split("T")[0];
dailyGoal.value = saveGoal;

displaySessions();
updateDashboard();
updateChart();
updateStreak();
updateWeeklyChart();
updateGoal();

studyForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const subject = document.getElementById("subject").value;
    const topic = document.getElementById("topic").value.trim();
    const duration = Number(document.getElementById("duration").value);
    const selectDate = studyDate.value;

    if (topic === "" || duration <= 0 || selectDate === "") {
        alert("Please enter a topic ,duration and date.");
        return;
    }

    const session = {
        subject: subject,
        topic: topic,
        duration: duration,
        date: selectDate
    };

    sessions.push(session);

    saveSessions();
    displaySessions();
    updateDashboard();
    updateChart();
    updateStreak();
    updateWeeklyChart();
    updateGoal();

    studyForm.reset();
});


function saveSessions() {
    localStorage.setItem(
        "studySessions",
        JSON.stringify(sessions)
    );
}


function displaySessions() {

    sessionList.innerHTML = "";

    if (sessions.length === 0) {
        sessionList.innerHTML =
            "<p>No study sessions recorded yet.</p>";
        return;
    }

    sessions.forEach(function (session,index) {

        const sessionItem = document.createElement("div");

        sessionItem.innerHTML = `
            <h3>${session.subject}</h3>
            <p>Topic: ${session.topic}</p>
            <p>Duration: ${session.duration} hours</p>
            <small>Date: ${session.date}</small>
            <div>
                <button 
                    class="edit-btn"
                    onclick="editSession(${index})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteSession(${index})"
                >
                    Delete
                </button>
            </div>
        `;

        sessionList.appendChild(sessionItem);
    });
}

function updateDashboard() { 
 
    let totalHoursStudied = 0; 
    let todayHoursStudied = 0; 
 
    const today = new Date().toISOString().split("T")[0]; 
 
    sessions.forEach(function(session) { 
 
        totalHoursStudied += Number(session.duration);       
 
        if (session.date === today) { 
            todayHoursStudied += Number(session.duration);   
        } 
    }); 
 
    const total = totalHoursStudied; 
    const todayTime = todayHoursStudied; 
 
    totalHours.textContent = total.toFixed(1); 
 
    todayHours.textContent = todayTime.toFixed(1); 
 
    sessionCount.textContent = sessions.length; 
}

function updateChart() {

    const chartCanvas =
        document.getElementById("subject-chart");

    if (subjectChart) {
        subjectChart.destroy();
    }

    const subjectTotal = {};

    sessions.forEach(function (session) {

        if (subjectTotal[session.subject]) {

            subjectTotal[session.subject] +=
                session.duration;

        } else {

            subjectTotal[session.subject] =
                session.duration;

        }
    });

    const subjects =
        Object.keys(subjectTotal);

    const studyHoursData =
        Object.values(subjectTotal);

    if (subjects.length === 0) {
        return;
    }

    subjectChart = new Chart(
        chartCanvas,
        {
            type: "pie",

            data: {

                labels: subjects,

                datasets: [
                    {
                        label: "Study Time",
                        data: studyHoursData
                    }
                ]
            },

            options: {

                responsive: true,

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }
        }
    );
}

function deleteSession(index) {
    const confirmDelete = confirm("Are you sure you want to delete this session");

    if (!confirmDelete) {
        return;
    }

    sessions.splice(index, 1);

    saveSessions();

    displaySessions();
    updateDashboard();
    updateChart();
    updateStreak();
    updateWeeklyChart();
    updateGoal();
}

function editSession(index) {
    const session = sessions[index];

    const newTopic = prompt("Enter the new topic:",
        session.topic);

    if (newTopic === null) {
        return;
    }

    const newDuration = prompt("Enter duration in Hours",
        session.duration
        );
    if (newDuration === null) {
        return;
    }

    const durationNumber = Number(newDuration);

    if (
        newTopic.trim() === "" ||
        durationNumber <= 0
    ) {
        alert(
            "Please enter valid information."
        );
        return;
    }

    session.topic = newTopic.trim();

    session.duration = durationNumber;

    saveSessions();

    displaySessions();
    updateDashboard();
    updateChart();
    updateStreak();
    updateWeeklyChart();
    updateGoal();
}

function updateStreak() {

    if (sessions.length === 0) {
        streakCount.textContent = "0";
        return;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Get all unique study dates
    const studyDates = [
        ...new Set(
            sessions.map(function(session) {
                return session.date;
            })
        )
    ];

    // Sort dates from newest to oldest
    studyDates.sort(function(a, b) {
        return new Date(b) - new Date(a);
    });

    // If the most recent study date is not today,
    // the current streak is 0
    if (studyDates[0] !== today) {
        streakCount.textContent = "0";
        return;
    }

    let streak = 1;

    // Check each previous day
    for (let i = 0; i < studyDates.length - 1; i++) {

        const currentDate = new Date(studyDates[i]);
        const previousDate = new Date(studyDates[i + 1]);

        const difference =
            (currentDate - previousDate) /
            (1000 * 60 * 60 * 24);

        if (difference === 1) {
            streak++;
        } else {
            break;
        }
    }

    streakCount.textContent = streak;
}

function updateWeeklyChart() {

    const weeklyCanvas =
        document.getElementById("weekly-chart");

    if (!weeklyCanvas) {
        return;
    }

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    const today = new Date();

    const labels = [];
    const dailyHours = [];

    // Last 7 days
    for (let i = 6; i >= 0; i--) {

        const date = new Date(today);

        date.setDate(today.getDate() - i);

        // Convert date to YYYY-MM-DD
        const dateString =
            date.toISOString().split("T")[0];

        // Get day name
        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );

        labels.push(dayName);

        let hours = 0;

        // Add all sessions for this date
        sessions.forEach(function(session) {

            if (session.date === dateString) {
                hours += Number(session.duration);
            }

        });

        dailyHours.push(hours);
    }

    weeklyChart = new Chart(
        weeklyCanvas,
        {
            type: "bar",

            data: {

                labels: labels,

                datasets: [
                    {
                        label: "Study Time (hours)",
                        data: dailyHours
                    }
                ]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {
                        beginAtZero: true
                    }

                }

            }
        }
    );
}


saveGoalButton.addEventListener("click",function() {
    const newGoal = Number(dailyGoal.value);
    
    if (newGoal <= 0) {
        alert("Please enter a valid daily goal.");
        return;
    }
    saveGoal = newGoal;

    localStorage.setItem("dailyGoal",saveGoal);
    updateGoal();
    
    alert("Daily goal saved successfully!");
});

function updateGoal() {
    const today = 
        new Date().toISOString().split("T")[0];

    let todayHoursStudied = 0;

    sessions.forEach(function(session) {
        if (session.date === today) {
            todayHoursStudied += session.duration;
        }
    });

    const progress = Math.min(
        (todayHoursStudied / saveGoal) * 100,
        100
    );

    goalProgressBar.style.width = progress + "%";

    goalText.textContent =
        todayHoursStudied.toFixed(1) +
        " / " +
        saveGoal.toFixed(1) +
        " hours";
};
