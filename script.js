const DATA = {
    shops: { title: 'Retail Stores', items: ['Apple Store - L1', 'H&M - L1', 'Next - L0', 'Zara - L1', 'Nike - L0'] },
    food: { title: 'Dining', items: ['McDonalds - L0', 'Wagamama - L1', 'Zizzi - L1', 'Starbucks - L0'] },
    services: { title: 'Services', items: ['NatWest - L0', 'Barclays - L1', 'Customer Desk - L0'] },
    parking: { title: 'Parking', items: ['Multi-Storey North', 'Disabled Parking Area', 'EV Charging - L0'] }
};

const STATE = {
    zoom: 1.2,
    level: 0,
    text: false,
    audio: true,
    query: "",
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep() {
    if (!STATE.audio) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function toggleModal(id, show) {
    beep();
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.toggle('active', show);
    }
}  

function setLevel(lvl) {
    beep();
    STATE.level = lvl;
    document.querySelectorAll('.lvl-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lvl == lvl);
    });
    document.querySelectorAll('.map-layer').forEach((l, i) => {
        l.style.opacity = (i == lvl) ? '1' : '0';
    });
}

function updateMapTransform() {
    const canvas = document.getElementById('map-canvas');
    canvas.style.transform = `translate(${STATE.translateX}px, ${STATE.translateY}px) scale(${STATE.zoom})`;
}

function zoom(amt) {
    beep();
    const newZoom = Math.min(Math.max(STATE.zoom + amt, 1), 4);
    STATE.zoom = newZoom;
    updateMapTransform();
}

const viewport = document.querySelector('.map-viewport');

viewport.addEventListener('mousedown', (e) => {
    e.preventDefault(); 
    STATE.isDragging = true; // Fixed: Now enables dragging
    STATE.startX = e.clientX - STATE.translateX;
    STATE.startY = e.clientY - STATE.translateY;
    viewport.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!STATE.isDragging) return;
    STATE.translateX = e.clientX - STATE.startX;
    STATE.translateY = e.clientY - STATE.startY;
    updateMapTransform();
});

window.addEventListener('mouseup', () => {
    STATE.isDragging = false;
    viewport.style.cursor = 'grab';
});

function showCat(id) {
    beep();
    document.getElementById('nav-home').style.display = 'none';
    const det = document.getElementById('nav-details');
    det.classList.add('active');
    document.getElementById('cat-name').innerText = DATA[id].title;
    document.getElementById('cat-list').innerHTML = DATA[id].items.map(i => `<div class="list-item">${i}</div>`).join('');
}

function hideCat() {
    beep();
    document.getElementById('nav-details').classList.remove('active');
    document.getElementById('nav-home').style.display = 'grid';
}

function initKB() {
    const container = document.getElementById('kb');
    "QWERTYUIOPASDFGHJKLZXCVBNM".split('').forEach(k => {
        const b = document.createElement('button');
        b.className = "key";
        b.innerText = k;
        b.onclick = () => { STATE.query += k; updateSearch(); };
        container.appendChild(b);
    });
    const del = document.createElement('button');
    del.className = "key key-del";
    del.innerText = "DEL";
    del.onclick = () => { STATE.query = STATE.query.slice(0, -1); updateSearch(); };
    container.appendChild(del);
}

function updateSearch() {
    beep();
    document.getElementById('search-input').innerText = STATE.query;
    const res = document.getElementById('search-results');
    const allItems = Object.values(DATA).flatMap(d => d.items);
    const matches = allItems.filter(i => i.toLowerCase().includes(STATE.query.toLowerCase()));

    res.innerHTML = STATE.query ?
        matches.map(m => `
            <div class="list-item" style="color: black; border-color: #eee; padding: 12px; display: flex; justify-content: space-between;">
                <span>${m}</span>
                <i class="ph ph-arrow-right" style="color: var(--emerald)"></i>
            </div>`).join('') :
        '<div style="color: #94a3b8; font-style: italic; text-align: center; margin-top: 2rem;">Start typing...</div>';
}

function toggleAccessibility(type) {
  
    beep();
    STATE[type] = !STATE[type]; 
    
    if (type === 'text') {
        document.getElementById('app').classList.toggle('large-text', STATE.text);
        document.getElementById('btn-text-toggle').classList.toggle('active', STATE.text);
    } else if (type === 'audio') {
        document.getElementById('btn-audio-toggle').classList.toggle('active', STATE.audio);
    }
}

window.onload = () => {
    initKB();
    setLevel(0);
    
    if (STATE.audio) {
        document.getElementById('btn-audio-toggle').classList.add('active');
    }
    if (STATE.text) {
        document.getElementById('btn-text-toggle').classList.add('active');
    }
};

