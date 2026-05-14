// ====================== INITIALIZATION ======================
window.animeData = window.animeData || [];

document.addEventListener("DOMContentLoaded", () => {
    createBoxes('si-inputs', 'si-link');
    createBoxes('en-inputs', 'en-link');
    typeEffect();
    renderLatest();
    updateNotificationCount();
});

// ====================== ADMIN PANEL BOXES ======================
function createBoxes(containerId, className) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; 
    for (let i = 1; i <= 100; i++) {
        container.innerHTML += `
            <div class="flex flex-col gap-1">
                <span class="text-[9px] text-gray-500 font-black uppercase tracking-tighter">Episode ${i}</span>
                <input type="text" class="${className} bg-white/5 border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-red-600 text-white" placeholder="Paste Link">
            </div>`;
    }
}

// ====================== PAGE NAVIGATION ======================
function showPage(pageId) {
    const sections = ['home-page', 'latest-page', 'leaderboard-page', 'requests-page', 'login-page'];

    sections.forEach(s => {
        const el = document.getElementById(s);
        // මෙන්න මෙහෙම if (el) කියලා චෙක් කරාම තමයි අර Error එක නවතින්නේ 👇
        if (el) {
            el.classList.add('hidden');
        }
    });

    if (pageId === 'leaderboard') {
        const lbPage = document.getElementById('leaderboard-page');
        const loginPage = document.getElementById('login-page');

        if (localStorage.getItem('adminLoggedIn') === 'true') {
            if (lbPage) lbPage.classList.remove('hidden');
        } else {
            if (loginPage) loginPage.classList.remove('hidden');
        }
    } else {
        const target = document.getElementById(pageId + '-page');
        if (target) target.classList.remove('hidden');
    }

    // අර ad-thanks-message එකටත් safety check එකක් දාමු
    const thanksMessage = document.getElementById('ad-thanks-message');
    if (thanksMessage) {
        thanksMessage.style.display = (pageId === 'home') ? 'table' : 'none';
    }
}

// ====================== ADMIN AUTH ======================
function checkAdmin() {
    const password = document.getElementById('adminPass').value.trim();
    if (password === "maduwa416@gmail.com") {
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('leaderboard-page').classList.remove('hidden');
        showToast("✅ Login Successful!", "success");
    } else {
        alert("❌ Wrong Password!");
        document.getElementById('adminPass').value = "";
    }
}

function logoutAdmin() {
    if (confirm("Logout කරන්න ඕනේද?")) {
        localStorage.removeItem('adminLoggedIn');
        showPage('home');
    }
}

// ====================== TABS & MENU ======================
function switchTab(lang) {
    const siIn = document.getElementById('si-inputs');
    const enIn = document.getElementById('en-inputs');
    const siBtn = document.getElementById('tab-si');
    const enBtn = document.getElementById('tab-en');

    if (lang === 'si') {
        siIn.classList.remove('hidden'); enIn.classList.add('hidden');
        siBtn.classList.add('text-red-500', 'border-b-4', 'border-red-600');
        enBtn.classList.remove('text-red-500', 'border-b-4', 'border-red-600');
    } else {
        enIn.classList.remove('hidden'); siIn.classList.add('hidden');
        enBtn.classList.add('text-red-500', 'border-b-4', 'border-red-600');
        siBtn.classList.remove('text-red-500', 'border-b-4', 'border-red-600');
    }
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('hidden');
}

// ====================== SEARCH ======================
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
    if (!list) return;

    list.innerHTML = "";
    const results = (window.animeData || []).filter(s => s.name.toLowerCase().includes(filter));

    if (results.length === 0) {
        notFound.classList.remove('hidden');
        notFound.innerHTML = `<div class="bg-black/60 border border-white/10 p-10 rounded-3xl inline-block max-w-lg shadow-2xl text-center">
            <i class="fas fa-ghost text-5xl text-red-600 mb-6"></i>
            <h2 class="text-2xl font-black mb-4">Anime Not Found!</h2>
        </div>`;
        return;
    }

    notFound.classList.add('hidden');
    results.forEach(s => {
        list.innerHTML += `
            <div onclick="window.location.href='anime-details.html?id=${s.id}'" class="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-red-600/50 cursor-pointer transition-all group">
                <h3 class="text-xl font-black uppercase group-hover:text-red-500">${s.name}</h3>
                <p class="text-[10px] text-gray-500 mt-2">Season ${s.season} • ${s.releaseDate}</p>
            </div>`;
    });
}

// ====================== CODE GENERATOR ======================
function generateAnimeCode() {
    const name = document.getElementById('upName').value.trim();
    if (!name) { alert("Anime නම ඇතුලත් කරන්න!"); return; }

    const id = name.toLowerCase().replace(/\s+/g, '-');
    const extract = (className) => Array.from(document.getElementsByClassName(className))
        .map((el, i) => ({ ep: i + 1, url: el.value.trim() }))
        .filter(item => item.url !== "");

    const code = `{
    id: "${id}",
    name: "${name}",
    season: "${document.getElementById('upSeason').value}",
    releaseDate: "${document.getElementById('upDate').value}",
    description: "${document.getElementById('upDesc').value.replace(/\n/g, ' ')}",
    sinhalaSubs: ${JSON.stringify(extract('si-link'), null, 8)},
    englishSubs: ${JSON.stringify(extract('en-link'), null, 8)},
    time: ${new Date().getTime()}
},`;

    document.getElementById('finalCode').value = code;
    document.getElementById('codeDisplay').classList.remove('hidden');
}

// ====================== FIREBASE SAVE ======================
window.handleGenerateAndSave = async function() {
    const name = document.getElementById('upName').value.trim();
    if (!name) {
        alert("Anime නම ඇතුලත් කරන්න!");
        return;
    }

    generateAnimeCode(); // කෝඩ් ජෙනරේට් කරනවා

    try {
        await addDoc(collection(db, "animes"), {
            name: name,
            season: document.getElementById('upSeason').value || "",
            releaseDate: document.getElementById('upDate').value || "",
            description: document.getElementById('upDesc').value || "",
            createdAt: serverTimestamp()
        });

        alert("✅ සාර්ථකව Firebase එකට සේව් වුණා!");
    } catch (error) {
        console.error(error);
        alert("Firebase සේව් වෙන්නේ නැහැ: " + error.message);
    }
};

// ====================== REQUESTS ======================
function submitRequest() {
    // ... ඔයාගේ පෙර තිබුණු submitRequest function එකම තියෙන්න දෙන්න
    // (ඔයාගේ කෝඩ් එකේ තිබුණු එකම තියෙන්න)
}

// ====================== NOTIFICATIONS ======================
function updateNotificationCount() {
    const countEl = document.getElementById('notif-count');
    let requests = JSON.parse(localStorage.getItem('userRequests')) || [];
    if (requests.length > 0) {
        countEl.textContent = requests.length;
        countEl.classList.remove('hidden');
    } else {
        countEl.classList.add('hidden');
    }
}

function showRequestsModal() {
    const modal = document.getElementById('requestsModal');
    const listContainer = document.getElementById('requestList'); // HTML එකේ තියෙන ID එකට සමාන විය යුතුයි
    
    if (!modal || !listContainer) return; // ID එක නැත්නම් මෙතනින් නතර වෙනවා

    const requests = JSON.parse(localStorage.getItem('userRequests')) || [];
    
    listContainer.innerHTML = '';
    if (requests.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-500 py-10">තවම රික්වෙස්ට් මුකුත් නෑ මචං! 😴</p>';
    } else {
        [...requests].reverse().forEach(req => {
            const item = document.createElement('div');
            item.className = "bg-black/40 border border-white/5 p-4 rounded-2xl flex justify-between items-center mb-2";
            item.innerHTML = `
                <div>
                    <h4 class="text-red-500 font-bold uppercase text-sm">${req.anime}</h4>
                    <p class="text-xs text-gray-400 mt-1">${req.season}</p>
                </div>`;
            listContainer.appendChild(item);
        });
    }
    modal.classList.remove('hidden');
}

// ====================== HELPERS ======================
function showToast(text, type = "success") {
    const msg = document.createElement('div');
    msg.className = `fixed top-6 left-1/2 -translate-x-1/2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-8 py-4 rounded-2xl font-bold shadow-2xl z-[100]`;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
}

// ====================== EFFECTS & HELPERS ======================
function typeEffect() {
    let words = window.animeData.length > 0 ? window.animeData.map(a => a.name + ".") : ["New Anime.", "Latest Subs.", "Your Requests."];
    let i = 0, j = 0, del = false;
    const el = document.getElementById("typewriter");
    if (!el) return;

    function type() {
        const curr = words[i];
        el.textContent = del ? curr.substring(0, j--) : curr.substring(0, j++);
        if (!del && j > curr.length) {
            del = true;
            setTimeout(type, 2000);
        } else if (del && j < 0) {
            del = false;
            i = (i + 1) % words.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, del ? 50 : 100);
        }
    }
    type();
}

function showToast(text, type) {
    const msg = document.createElement('div');
    msg.className = `fixed top-6 left-1/2 -translate-x-1/2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-8 py-4 rounded-2xl font-bold shadow-2xl z-[100]`;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
}
// මේ කෝඩ් එක script.js එකේ අන්තිමටම පේස්ට් කරන්න
function closeRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (modal) {
        modal.classList.add('hidden');
        console.log("Modal closed correctly!"); 
    }
}
// මේක script.js එකේ අන්තිමටම දාන්න
function clearAllRequests() {
    // පරිශීලකයාගෙන් අහනවා ඇත්තටම මකන්න ඕනෙද කියලා
    if (confirm("ඔක්කොම Requests ටික මකන්නද? මේක ආපහු ගන්න බැහැ!")) {
        
        // LocalStorage එකේ තියෙන data මකනවා
        localStorage.removeItem('userRequests');
        
        // බෙල් එකේ අංකය (Notification Count) බිංදු කරනවා
        const countEl = document.getElementById('notif-count');
        if (countEl) {
            countEl.textContent = '0';
            countEl.classList.add('hidden');
        }
        
        // දැන් Modal එක ඇතුළේ තියෙන ලිස්ට් එක හිස් කරලා පෙන්වන්න
        const listContainer = document.getElementById('requestList');
        if (listContainer) {
            listContainer.innerHTML = '<p class="text-center text-gray-500 py-10">ඔක්කොම මැකුවා මචං! 🧹</p>';
        }
        
        console.log("All requests cleared!");
    }
}