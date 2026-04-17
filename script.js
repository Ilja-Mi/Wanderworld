const worldEl = document.getElementById('world');
const nameInput = document.getElementById('nameInput');
const chatInput = document.getElementById('chatInput');
const API_URL = 'https://tinkr.tech/sdb/wanderworldIlja/wanderworldIlja';

let playerKey = localStorage.getItem('player_key');

async function updateWorld() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const playersInWorld = worldEl.querySelectorAll('.player');
        playersInWorld.forEach(p => p.remove());

        data.players.forEach(player => {
            const char = document.createElement('div');
            char.className = 'player';
            char.style.left = player.x + 'px';
            char.style.top = player.y + 'px';

            if (player.message) {
                const bubble = document.createElement('div');
                bubble.className = 'speech-bubble';
                bubble.innerText = player.message;
                char.appendChild(bubble);
            }

            const img = document.createElement('img');
            img.src = "https://tinkr.tech" + player.image;
            char.appendChild(img);

            const nameTag = document.createElement('div');
            nameTag.className = 'username';
            nameTag.innerText = player.username;
            char.appendChild(nameTag);

            worldEl.appendChild(char);
        });
    } catch (err) {
        console.error(err);
    }
}

async function joinWorld() {
    const name = nameInput.value.trim();
    if (!name) return alert("Sisesta nimi!");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'join', username: name })
        });
        
        const result = await response.json();
        if (result.ok) {
            playerKey = result.player_key;
            localStorage.setItem('player_key', playerKey);
            alert("Oled maailmas!");
        } else {
            alert("Viga: " + (result.error || "Tundmatu viga"));
        }
    } catch (err) {
        alert("Side viga serveriga");
    }
}

async function sendMessage() {
    if (!playerKey) return alert("Sa pead esmalt liituma!");
    const msg = chatInput.value.trim();
    if (!msg) return;

    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'talk',
            player_key: playerKey,
            message: msg
        })
    });
    chatInput.value = '';
}

worldEl.addEventListener('click', async (e) => {
    if (!playerKey) return;

    const rect = worldEl.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'move',
            player_key: playerKey,
            x: x,
            y: y
        })
    });
});

document.querySelectorAll('button')[0].onclick = joinWorld;
document.querySelectorAll('button')[1].onclick = sendMessage;

setInterval(updateWorld, 1000);
updateWorld();