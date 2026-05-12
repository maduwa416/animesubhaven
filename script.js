// --- INIT FUNCTIONS ---
document.addEventListener("DOMContentLoaded", () => {
    createBoxes('si-inputs', 'si-link');
    createBoxes('en-inputs', 'en-link');
    typeEffect();
    renderLatest();
});

// Admin Panel බොක්ස් 100 සෑදීම
function createBoxes(containerId, className) {
    const container = document.getElementById(containerId);
    if (!container) return;
    for (let i = 1; i <= 100; i++) {
        container.innerHTML += `
            <div class="flex flex-col gap-1">
                <span class="text-[9px] text-gray-500 font-black uppercase tracking-tighter">Episode ${i}</span>
                <input type="text" class="${className} bg-white/5 border border-white/10 p-2 rounded text-[10px] outline-none focus:border-red-600 text-white" placeholder="Paste Link">
            </div>`;
    }
}

// --- PAGE NAVIGATION ---
function showPage(pageId) {
    const pages = ['home', 'latest', 'requests', 'leaderboard', 'login', 'status'];
    pages.forEach(p => {
        const el = document.getElementById(p + '-page');
        if(el) el.classList.add('hidden');
    });
    
    if (pageId === 'leaderboard') {
        document.getElementById('login-page').classList.remove('hidden');
    } else {
        const target = document.getElementById(pageId + '-page');
        if(target) target.classList.remove('hidden');
    }
}

// --- STATUS VIEWS LOGIC ---
function showStatusPage() {
    showPage('status');
    const animeData = window.animeData || [];
    
    // Total Stats
    document.getElementById('stat-total-anime').innerText = animeData.length;
    let totalSubs = 0;
    animeData.forEach(anime => {
        totalSubs += (anime.sinhalaSubs ? anime.sinhalaSubs.length : 0);
        totalSubs += (anime.englishSubs ? anime.englishSubs.length : 0);
    });
    document.getElementById('stat-total-subs').innerText = totalSubs;

    // History List
    const historyList = document.getElementById('status-history');
    historyList.innerHTML = "";
    const recent = [...animeData].reverse().slice(0, 5);
    
    recent.forEach(anime => {
        historyList.innerHTML += `
            <div class="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                <div>
                    <h4 class="font-black text-xs uppercase tracking-tighter">${anime.name}</h4>
                    <p class="text-[9px] text-gray-500 font-bold uppercase">S${anime.season} • ${anime.releaseDate}</p>
                </div>
                <div class="text-right">
                    <span class="bg-red-900/30 text-red-500 px-3 py-1 rounded-full font-black text-[9px] uppercase">
                        ${(anime.sinhalaSubs ? anime.sinhalaSubs.length : 0) + (anime.englishSubs ? anime.englishSubs.length : 0)} LINKS
                    </span>
                </div>
            </div>`;
    });
}

// --- ADMIN LOGIN ---
function handleAdminLogin(e) { if(e.key === 'Enter') checkAdmin(); }
function checkAdmin() {
    if (document.getElementById('adminPass').value === "maduwa416@gmail.com") {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('leaderboard-page').classList.remove('hidden');
    } else { alert("Access Denied!"); }
}

// --- TABS ---
function switchTab(lang) {
    const siIn = document.getElementById('si-inputs'), enIn = document.getElementById('en-inputs');
    const siBtn = document.getElementById('tab-si'), enBtn = document.getElementById('tab-en');
    if (lang === 'si') {
        siIn.classList.remove('hidden'); enIn.classList.add('hidden');
        siBtn.classList.add('text-red-500', 'border-b-2', 'border-red-500');
        enBtn.classList.remove('text-red-500', 'border-b-2', 'border-red-500');
        enBtn.classList.add('text-gray-500');
    } else {
        enIn.classList.remove('hidden'); siIn.classList.add('hidden');
        enBtn.classList.add('text-red-500', 'border-b-2', 'border-red-500');
        siBtn.classList.remove('text-red-500', 'border-b-2', 'border-red-500');
        siBtn.classList.add('text-gray-500');
    }
}

// --- SEARCH & RENDER ---
function handleSearch(e) {
    if (e.key === 'Enter') {
        const q = document.getElementById('searchInput').value.toLowerCase().trim();
        showPage('latest');
        renderLatest(q);
    }
}

function renderLatest(filter = "") {
    const list = document.getElementById('latest-list');
    const notFound = document.getElementById('not-found');
    if(!list) return;
    list.innerHTML = "";
    const results = window.animeData.filter(s => s.name.toLowerCase().includes(filter));
    
    if (results.length === 0) {
        notFound.classList.remove('hidden');
        notFound.innerHTML = `
            <div class="bg-black/60 border border-white/10 p-10 rounded-3xl inline-block max-w-lg shadow-2xl">
                <i class="fas fa-ghost text-5xl text-red-600 mb-6"></i>
                <h2 class="text-2xl font-black mb-4 uppercase">Anime Not Found!</h2>
                <button onclick="showPage('requests')" class="bg-red-700 text-white px-10 py-4 rounded-xl font-black hover:bg-red-600 transition shadow-xl">REQUEST NOW</button>
            </div>`;
        return;
    }
    notFound.classList.add('hidden');
    results.forEach(s => {
        list.innerHTML += `
            <div onclick="window.location.href='anime-details.html?id=${s.id}'" 
                 class="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-red-600/50 cursor-pointer transition-all group">
                <h3 class="text-xl font-black uppercase group-hover:text-red-500 tracking-tighter">${s.name}</h3>
                <p class="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Season ${s.season} • ${s.releaseDate}</p>
            </div>`;
    });
}

// --- DATA GEN ---
function generateAnimeCode() {
    const name = document.getElementById('upName').value;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const extract = (className) => {
        return Array.from(document.getElementsByClassName(className))
            .map((el, i) => ({ ep: i + 1, url: el.value.trim() }))
            .filter(item => item.url !== "");
    };
    const code = `{
    id: "${id}",
    name: "${name}",
    season: "${document.getElementById('upSeason').value}",
    releaseDate: "${document.getElementById('upDate').value}",
    description: "${document.getElementById('upDesc').value.replace(/\n/g, ' ')}",
    sinhalaSubs: ${JSON.stringify(extract('si-link'), null, 8)},
    englishSubs: ${JSON.stringify(extract('en-link'), null, 8)},
    time: new Date().getTime()
},`;
    document.getElementById('finalCode').value = code;
    document.getElementById('codeDisplay').classList.remove('hidden');
}

function copyToClipboard() {
    document.getElementById('finalCode').select();
    document.execCommand('copy');
    alert("Code Copied!");
}

// --- TYPEWRITER ---
function typeEffect() {
    let words = window.animeData.map(a => a.name + ".");
    if (words.length === 0) words = ["New Anime.", "Latest Subs.", "Your Requests."];
    let i = 0, j = 0, del = false;
    const el = document.getElementById("typewriter");
    if(!el) return;
    function type() {
        const curr = words[i];
        el.textContent = del ? curr.substring(0, j--) : curr.substring(0, j++);
        if (!del && j > curr.length) { del = true; setTimeout(type, 2000); }
        else if (del && j < 0) { del = false; i = (i + 1) % words.length; setTimeout(type, 500); }
        else setTimeout(type, del ? 50 : 100);
    }
    type();
}