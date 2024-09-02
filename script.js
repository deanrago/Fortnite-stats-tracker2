import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAsCjjOr7KguFLTusyTKadPJ1c4WfOYZs4",
    authDomain: "fortnite-stat-tracker2.firebaseapp.com",
    projectId: "fortnite-stat-tracker2",
    storageBucket: "fortnite-stat-tracker2.appspot.com",
    messagingSenderId: "1027445489979",
    appId: "1:1027445489979:web:81ffac5422bf59c546f71e",
    measurementId: "G-6R3JGYZWFK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const statsForm = document.getElementById('statsForm');
const statsContainer = document.getElementById('statsContainer');
const afz1219Akpg = document.getElementById('afz1219-akpg');
const lisanAkpg = document.getElementById('lisan-akpg');

statsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const gamertag = document.getElementById('gamertag').value;
    const gameId = document.getElementById('gameId').value;
    const landingZone = document.getElementById('landingZone').value;
    const kills = parseInt(document.getElementById('kills').value);

    try {
        await addDoc(collection(db, "gameStats"), {
            gamertag,
            gameId,
            landingZone,
            kills,
            timestamp: new Date()
        });

        // Refresh the stats display after submission
        loadAllGameStats();
        calculateAkpg();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});

async function loadAllGameStats() {
    const statsQuery = query(collection(db, "gameStats"), orderBy("gameId", "desc"));
    const querySnapshot = await getDocs(statsQuery);

    // Create a nested object to store game stats by gameId
    let gameStats = {};

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const gameId = data.gameId;

        if (!gameStats[gameId]) {
            gameStats[gameId] = {
                AFZ1219: { kills: 0, landingZone: '' },
                'Lisan-Al-Gaib': { kills: 0, landingZone: '' },
                totalKills: 0
            };
        }

        gameStats[gameId][data.gamertag].kills = data.kills;
        gameStats[gameId][data.gamertag].landingZone = data.landingZone;
        gameStats[gameId].totalKills += data.kills;
    });

    // Clear existing stats display
    statsContainer.innerHTML = '';

    // Generate and display tables for each gameId, most recent first
    for (const gameId in gameStats) {
        const gameData = gameStats[gameId];
        const gameTable = `
            <table>
                <caption>Game ID: ${gameId}</caption>
                <tr><th>Gamertag</th><th>Landing Zone</th><th>Kills</th></tr>
                <tr><td>AFZ1219</td><td>${gameData['AFZ1219'].landingZone}</td><td>${gameData['AFZ1219'].kills}</td></tr>
                <tr><td>Lisan-Al-Gaib</td><td>${gameData['Lisan-Al-Gaib'].landingZone}</td><td>${gameData['Lisan-Al-Gaib'].kills}</td></tr>
                <tr><th colspan="2">Total Team Kills</th><th>${gameData.totalKills}</th></tr>
            </table>
        `;
        statsContainer.innerHTML = gameTable + statsContainer.innerHTML;
    }
}

async function calculateAkpg() {
    const statsQuery = query(collection(db, "gameStats"));
    const querySnapshot = await getDocs(statsQuery);

    let afz1219TotalKills = 0, afz1219Games = 0;
    let lisanTotalKills = 0, lisanGames = 0;
    let gameIds = new Set();

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        gameIds.add(data.gameId);

        if (data.gamertag === "AFZ1219") {
            afz1219TotalKills += data.kills;
            afz1219Games++;
        } else if (data.gamertag === "Lisan-Al-Gaib") {
            lisanTotalKills += data.kills;
            lisanGames++;
        }
    });

    const afz1219AkpgValue = afz1219Games > 0 ? (afz1219TotalKills / gameIds.size).toFixed(2) : 0;
    const lisanAkpgValue = lisanGames > 0 ? (lisanTotalKills / gameIds.size).toFixed(2) : 0;

    afz1219Akpg.textContent = `AFZ1219 AKPG: ${afz1219AkpgValue}`;
    lisanAkpg.textContent = `Lisan-Al-Gaib AKPG: ${lisanAkpgValue}`;
}

// Load all game stats and AKPG on page load
loadAllGameStats();
calculateAkpg();
