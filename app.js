// app.js - Gestion du Gang Delaque, Recrutement, Équipements, Compétences et Modales

// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================
let appState = { view: 'menu', mode: null, editTarget: null, isQuickMatch: false, returnTo: null };
let savedGangs = JSON.parse(localStorage.getItem('delaqueGangs')) || {};
let currentGang = null;
let tempFighter = null;

function saveGangs() {
    if (currentGang && currentGang.name) {
        currentGang.faction = 'Delaque';
        savedGangs[currentGang.name] = currentGang;
    }
    localStorage.setItem('delaqueGangs', JSON.stringify(savedGangs));
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function isMercOrBeastProfile(fighter) {
    let types = (fighter.type || []).map(t => String(t).toLowerCase());
    return types.includes("bête") || types.includes("bette") || types.includes("hanger-on") || (fighter.charId && fighter.charId.startsWith("merc_") && fighter.charId !== "merc_hive_scum");
}

function isLockedDelaqueBeast(fighter) {
    if (!fighter) return false;
    let lockedIds = ['char_piscean_spektor', 'char_cephalopod_spektor', 'char_psychoteric_wyrm'];
    return lockedIds.includes(fighter.charId) || fighter.cannot_buy_gear === true;
}

function calculateFighterCost(m) {
    const char = db.characters.find(c => c.id === m.charId);
    if (!char) return 0;
    let total = char.cost;

    if (m.isWyrd && (m.charId === 'char_master_of_shadow' || m.charId === 'char_phantom')) {
        total += 35;
    }
    
    (m.weapons || []).forEach(w => {
        if (!w) return;
        const isDefault = w.isDefault || (char.default_weapons && (char.default_weapons.includes(w.id) || char.default_weapons.includes(w.name)));
        if (!isDefault) {
            total += (w.cost_credits || w.cost || 0);
        }
        if (w.accessory && typeof w.accessory === 'object' && !w.accessory.isDefault) {
            total += (w.accessory.cost_credits || w.accessory.cost || 0);
        }
    });
    
    (m.equipment || []).forEach(e => {
        if (!e) return;
        const isDefault = e.isDefault || (char.default_equipment && (char.default_equipment.includes(e.id) || char.default_equipment.includes(e.name)));
        if (!isDefault) {
            total += (e.cost_credits || e.cost || 0);
        }
    });
    
    total += (m.advancesCost || 0);
    return total;
}

function calculateGangRating(gang) {
    if (!gang || !gang.members) return 0;
    let rating = 0;
    gang.members.forEach(m => {
        m.totalCost = calculateFighterCost(m);
        rating += m.totalCost;
    });
    gang.rating = rating;
    return rating;
}

function updateTopBar() {
    const topBar = document.getElementById('top-bar');
    if (!topBar) return;

    if (typeof currentGang === 'undefined' || !currentGang) {
        topBar.innerHTML = '';
        topBar.style.display = 'none';
        return;
    }

    topBar.style.display = 'block';
    topBar.classList.remove('hidden');

    let gangRating = typeof calculateGangRating === 'function' 
        ? calculateGangRating(currentGang) 
        : (currentGang.members || []).reduce((sum, m) => sum + (m.totalCost || m.cost || 0), 0);

    let stashVal = (currentGang.stash || []).reduce((sum, item) => {
        let itemCost = (typeof item === 'object') ? (item.cost || item.cost_credits || item.price || 0) : 0;
        return sum + itemCost;
    }, 0);

    let gangWealth = gangRating + stashVal + (currentGang.credits || 0);

    let totalRep = typeof calculateGangReputation === 'function' 
        ? calculateGangReputation(currentGang) 
        : ((currentGang.reputation !== undefined) ? currentGang.reputation : 1);

    topBar.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; padding:6px 15px; background:var(--panel-bg, #141820); border-bottom:1px solid #242b38; box-sizing:border-box; color:#fff;">
            <div>
                <strong>${currentGang.name || 'Gang'}</strong> <span style="color:var(--accent-purple); font-size:11px;">[Delaque]</span> | 
                Crédits : <strong style="color:var(--accent-cyan);">${currentGang.credits || 0} cr</strong> | 
                Gang Rating : <strong style="color:var(--accent-purple);">${gangRating} cr</strong> | 
                Richesse : <strong style="color:#f59e0b;">${gangWealth} cr</strong> | 
                Réputation : <strong style="color:#10b981;">${totalRep}</strong>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-cyan" style="padding:3px 10px; font-size:12px; cursor:pointer;" onclick="openStashModal()">📦 Réserve (Stash)</button>
                <button class="btn" style="padding:3px 10px; font-size:12px; cursor:pointer;" onclick="openTerritoriesModal()">🚩 Territoires</button>
                <button class="btn btn-cyan" style="padding:3px 10px; font-size:12px; cursor:pointer;" onclick="openMatchHistoryModal()">📜 Historique</button>
            </div>
        </div>
    `;
}

// ==========================================
// UI ROUTING
// ==========================================
function navigate(view) {
    appState.view = view;
    if (view !== 'fighter-edit' && view !== 'post-cycle') {
        appState.returnTo = null;
    }
    const container = document.getElementById('main-content');
    updateTopBar();

    switch(view) {
        case 'menu': renderMenu(container); break;
        case 'gang-create': renderGangCreate(container); break;
        case 'gang-select': renderGangSelect(container); break;
        case 'gang-manage': renderGangManage(container); break;
        case 'fighter-edit': renderFighterEdit(container); break;
        case 'game-setup': renderGameSetup(container); break;
        case 'post-cycle': 
            if (typeof renderPostCycleView === 'function') {
                renderPostCycleView(container);
            }
            break;
    }
}

// ==========================================
// VIEWS RENDERING
// ==========================================
function renderMenu(container) {
    currentGang = null;
    updateTopBar();
    container.innerHTML = `
        <div class="card" style="text-align:center;">
            <h2>Bienvenue dans les Ombres de Necromunda</h2>
            <p style="color:var(--accent-cyan); font-weight:bold; margin-top:4px;">House Delaque — Builder & Campaign Companion</p>
            <p style="color:#aaa; font-size:13px; margin: 8px 0 15px;">Gestion de gang, recrutement, pouvoirs psychoteric wyrd, suivi de campagne et combat.</p>
            <button onclick="navigate('gang-create')">Création de Gang Delaque</button><br>
            <button onclick="appState.mode='campaign'; navigate('gang-select')">Suivi de Gang Delaque (Campagne)</button><br>
            <hr style="border-color:var(--border-color); margin: 20px 0;">
            <button onclick="importGang()">Importer un gang (.json)</button>
        </div>
    `;
}

function renderGangCreate(container) {
    container.innerHTML = `
        <div class="card">
            <h2>Créer un nouveau gang Delaque</h2>
            <input type="text" id="new-gang-name" placeholder="Nom du gang Delaque">
            <button onclick="createGang()">Créer</button>
            <button class="btn-danger" onclick="navigate('menu')">Annuler</button>
        </div>
    `;
}

function createGang() {
    const name = document.getElementById('new-gang-name').value.trim();
    if(!name) return showToast("Veuillez saisir un nom de gang.", "error");
    if(savedGangs[name]) {
        showConfirmModal(
            "Gang existant",
            `Un gang nommé <strong>${name}</strong> existe déjà dans vos sauvegardes Delaque. Voulez-vous le remplacer ?`,
            "Écraser",
            () => {
                proceedCreateGang(name);
            }
        );
        return;
    }
    proceedCreateGang(name);
}

function proceedCreateGang(name) {
    currentGang = {
        name: name,
        faction: 'Delaque',
        credits: 1000,
        rating: 0,
        reputation: 1,
        members: [],
        stash: [],
        territories: [],
        tactics: [],
        isEstablished: false
    };
    savedGangs[name] = currentGang;
    saveGangs();
    appState.mode = 'campaign';
    navigate('gang-manage');
    showToast(`Gang Delaque ${name} créé avec succès !`, "success");
}

function renderGangSelect(container) {
    let html = `<div class="card"><h2>Sélectionner un gang Delaque</h2>`;
    if(Object.keys(savedGangs).length === 0) {
        html += `<p>Aucun gang Delaque sauvegardé.</p>`;
    } else {
        for(let name in savedGangs) {
            calculateGangRating(savedGangs[name]);
            html += `
                <div class="fighter-item">
                    <span><strong>${name}</strong> <small style="color:var(--accent-purple);">[Delaque]</small> (Rating: ${savedGangs[name].rating} cr)</span>
                    <div>
                        <button onclick="loadGang('${name}')">Gérer</button>
                        <button onclick="exportGang('${name}')">Export</button>
                        <button class="btn-danger" onclick="deleteGang('${name}')">X</button>
                    </div>
                </div>
            `;
        }
    }
    html += `<br><button class="btn-danger" onclick="navigate('menu')">Retour</button></div>`;
    container.innerHTML = html;
}

function ensureInnateFighterSkills(gang) {
    if (!gang || !gang.members) return;

    const choirSkill = {
        id: "sk_psychoteric_choir",
        name: "Psychoteric choir",
        desc: "Quand un guerrier Delaque se trouve à 3\" ou moins de deux ou plus alliés Delaque, leur Ld et leur Will augmentent de 1."
    };

    const shadowsSkill = {
        id: "sk_from_the_shadows",
        name: "From the shadows",
        desc: "Au lieu de déployer ce guerrier normalement, il peut être gardé de côté. Au début de n'importe quel round après le premier, avant le jet de priorité, il peut être déployé n'importe où sur le terrain, hors de ligne de vue et à plus de 9\" de tout ennemi.",
        specific_to: "char_nacht_ghul"
    };

    const sensorSkill = {
        id: "sk_sensor_array",
        name: "Sensor array",
        desc: "Si le Cephalopod Spektor est dans la distance de leash de son maitre quand celui-ci fait un test d'Int, celui-ci lance un dé de plus et garde le meilleur.",
        specific_to: "char_cephalopod_spektor"
    };

    const nodeSkill = {
        id: "sk_psychoteric_node",
        name: "Psychoteric node",
        desc: "Quand son maitre utilise un pouvoir psychoteric wyrd en étant à portée de leash, il peut lancer son pouvoir depuis le psychoteric wyrm.",
        specific_to: "char_psychoteric_wyrm"
    };

    const burrowSkill = {
        id: "sk_burrowing",
        name: "Burrowing",
        desc: "Peut se déplacer sous les terrains infranchissables.",
        specific_to: "char_psychoteric_wyrm"
    };

    const juggernautObj = {
        id: "sk_juggernaut",
        name: "Juggernaut",
        desc: "Si touché au tir, suppressed uniquement si PV perdu ou effet du dé de blessure.",
        specific_to: "brute"
    };

    gang.members.forEach(m => {
        if (!m.skills) m.skills = [];

        // Règle d'armée Delaque : Psychoteric choir pour tous les combattants Delaque
        const isDelaque = m.charId && m.charId.startsWith("char_");
        if (isDelaque) {
            const hasChoir = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase() === 'psychoteric choir' || (s.id && s.id === 'sk_psychoteric_choir');
            });
            if (!hasChoir) {
                m.skills.unshift(JSON.parse(JSON.stringify(choirSkill)));
            }
        }

        // Nacht-Ghul -> From the shadows
        if (m.charId === 'char_nacht_ghul') {
            const hasShadows = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase() === 'from the shadows' || (s.id && s.id === 'sk_from_the_shadows');
            });
            if (!hasShadows) {
                m.skills.push(JSON.parse(JSON.stringify(shadowsSkill)));
            }
        }

        // Cephalopod Spektor -> Sensor array & Leash de 3"
        if (m.charId === 'char_cephalopod_spektor') {
            const hasSensor = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase() === 'sensor array' || (s.id && s.id === 'sk_sensor_array');
            });
            if (!hasSensor) {
                m.skills.push(JSON.parse(JSON.stringify(sensorSkill)));
            }
            const hasLeash = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase().includes('leash');
            });
            if (!hasLeash) {
                m.skills.push({ id: "sk_leash_3", name: "Leash de 3\"", desc: "Portée de liaison avec son maître." });
            }
        }

        // Psychoteric Wyrm -> Psychoteric node, Burrowing & Leash de 12"
        if (m.charId === 'char_psychoteric_wyrm') {
            const hasNode = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase() === 'psychoteric node' || (s.id && s.id === 'sk_psychoteric_node');
            });
            if (!hasNode) {
                m.skills.push(JSON.parse(JSON.stringify(nodeSkill)));
            }
            const hasBurrow = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase() === 'burrowing' || (s.id && s.id === 'sk_burrowing');
            });
            if (!hasBurrow) {
                m.skills.push(JSON.parse(JSON.stringify(burrowSkill)));
            }
            const hasLeash = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase().includes('leash');
            });
            if (!hasLeash) {
                m.skills.push({ id: "sk_leash_12", name: "Leash de 12\"", desc: "Portée de liaison avec son maître." });
            }
        }

        // Brute -> Juggernaut (ex: Piscean Spektor, Armbot, Jotunn Ogryn)
        const isBrute = (m.type && Array.isArray(m.type) && m.type.some(t => String(t).toLowerCase() === 'brute')) ||
                        (m.charId && typeof db !== 'undefined' && db.characters && db.characters.some(c => c.id === m.charId && c.type && c.type.some(t => String(t).toLowerCase() === 'brute')));

        if (isBrute) {
            if (!m.type) m.type = [];
            if (!m.type.some(t => String(t).toLowerCase() === 'brute')) {
                m.type.push('brute');
            }
            const hasJugg = m.skills.some(s => {
                let n = (typeof s === 'string' ? s : s.name) || '';
                return n.toLowerCase() === 'juggernaut' || (s.id && s.id === 'sk_juggernaut');
            });
            if (!hasJugg) {
                m.skills.push(JSON.parse(JSON.stringify(juggernautObj)));
            }
        }

        // Migration grenades : ne prennent pas d'emplacements d'armes
        if (m.weapons && m.weapons.length > 0) {
            let toMove = [];
            m.weapons = m.weapons.filter(w => {
                let isGrenade = w.counts_as_equip || w.type === 'Grenade' || (w.id && (w.id.startsWith('wpn_grenade_') || w.id === 'wpn_charge_demo'));
                if (isGrenade) {
                    toMove.push(w);
                    return false;
                }
                return true;
            });
            if (toMove.length > 0) {
                if (!m.equipment) m.equipment = [];
                toMove.forEach(g => {
                    let item = JSON.parse(JSON.stringify(g));
                    item.type = "Grenade";
                    item.counts_as_equip = true;
                    m.equipment.push(item);
                });
            }
        }
    });

    if (gang.stash) {
        gang.stash.forEach(item => {
            if (item.counts_as_equip || (item.id && (item.id.startsWith('wpn_grenade_') || item.id === 'wpn_charge_demo'))) {
                item.type = "Grenade";
                item.counts_as_equip = true;
            }
        });
    }
}

function getWeaponSlotCost(w) {
    if (!w || !w.name) return 1;
    if (w.counts_as_equip || w.type === 'Grenade' || (w.id && (w.id.startsWith('wpn_grenade_') || w.id === 'wpn_charge_demo'))) {
        return 0;
    }
    if (!w.name.includes('*')) return 1;
    if (w.accessory && (
        w.accessory.id === 'eq_suspenseur' || 
        w.accessory.id === 'eq_suspensors' || 
        (w.accessory.name && (
            w.accessory.name.toLowerCase().includes('suspenseur') || 
            w.accessory.name.toLowerCase().includes('suspensor')
        ))
    )) {
        return 1;
    }
    return 2;
}

function loadGang(name) {
    currentGang = savedGangs[name];
    if (currentGang.isEstablished === undefined) {
        currentGang.isEstablished = true;
    }
    currentGang.faction = 'Delaque';
    ensureInnateFighterSkills(currentGang);
    ensureNoDuplicateTactics(currentGang);
    navigate('gang-manage');
}

// ==========================================
// GESTION ET AFFICHAGE DU GANG
// ==========================================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeForJsStr(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function showSkillInfoModal(skillName) {
    if (!skillName) return;
    let foundSkill = null;
    let foundCategory = '';

    if (typeof db !== 'undefined' && db.skills) {
        for (let cat in db.skills) {
            let match = db.skills[cat].find(s => s.name.toLowerCase() === skillName.toLowerCase() || s.id === skillName.toLowerCase());
            if (match) {
                foundSkill = match;
                foundCategory = cat;
                break;
            }
        }
    }

    if (!foundSkill && currentGang && currentGang.members) {
        for (let m of currentGang.members) {
            if (m.skills) {
                let match = m.skills.find(s => {
                    let n = typeof s === 'string' ? s : (s.name || s.id);
                    return n && n.toLowerCase() === skillName.toLowerCase();
                });
                if (match && typeof match === 'object' && match.desc) {
                    foundSkill = match;
                    break;
                }
            }
        }
    }

    let categoryDisplay = foundCategory ? (foundCategory.charAt(0).toUpperCase() + foundCategory.slice(1)) : 'Général';
    let desc = foundSkill ? foundSkill.desc : 'Aucune description détaillée répertoriée pour cette compétence.';

    let html = `
        <div style="padding:4px;">
            <div style="background:#1a1410; border:1px solid var(--accent-secondary); border-radius:6px; padding:14px; margin-bottom:12px;">
                <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#fdba74; font-weight:bold; margin-bottom:4px;">
                    Compétence • Catégorie : ${categoryDisplay}
                </div>
                <h3 style="margin:0 0 10px 0; color:#fff; font-size:18px;">${escapeHtml(skillName)}</h3>
                <p style="margin:0; font-size:14px; line-height:1.6; color:#eee;">${desc}</p>
            </div>
            <div style="text-align:right;">
                <button class="btn btn-cyan" onclick="closeModal()">Fermer</button>
            </div>
        </div>
    `;

    openModal(`Compétence : ${skillName}`, html);
}
window.showSkillInfoModal = showSkillInfoModal;

function showWeaponInfoModal(weaponName, fighterIdx) {
    if (!weaponName) return;
    let fighter = (currentGang && currentGang.members && fighterIdx !== undefined) ? currentGang.members[fighterIdx] : null;
    let w = null;

    if (fighter && fighter.weapons) {
        w = fighter.weapons.find(x => x.name.toLowerCase() === weaponName.toLowerCase() || x.id === weaponName);
    }
    if (!w && typeof db !== 'undefined' && db.weapons) {
        w = db.weapons.find(x => x.name.toLowerCase() === weaponName.toLowerCase() || x.id === weaponName);
    }
    if (!w && fighter && fighter.equipment) {
        w = fighter.equipment.find(x => x.name.toLowerCase() === weaponName.toLowerCase() || x.id === weaponName);
    }

    if (!w) {
        return openModal(`Arme : ${weaponName}`, `<p style="padding:10px; color:#aaa;">Informations non disponibles pour cette arme.</p>`);
    }

    let profiles = w.profiles || [];
    if (profiles.length === 0 && typeof db !== 'undefined' && db.weapons) {
        let dbW = db.weapons.find(x => x.name.toLowerCase() === w.name.toLowerCase() || x.id === w.id);
        if (dbW && dbW.profiles) profiles = dbW.profiles;
    }

    let traitsList = [];
    let traitSet = new Set();
    profiles.forEach(p => {
        if (p.traits) {
            p.traits.split(',').forEach(t => {
                let clean = t.trim();
                if (clean && !traitSet.has(clean.toLowerCase())) {
                    traitSet.add(clean.toLowerCase());
                    traitsList.push(clean);
                }
            });
        }
    });

    let traitsDescHTML = '';
    if (traitsList.length > 0) {
        traitsDescHTML = traitsList.map(t => {
            let baseKey = t.toLowerCase().replace(/\s*\(.*?\)/g, '').trim();
            let foundTrait = null;
            if (typeof db !== 'undefined' && db.weapon_traits) {
                foundTrait = db.weapon_traits.find(dt => dt.name.toLowerCase().replace(/\s*\(.*?\)/g, '').trim() === baseKey);
            }
            let desc = foundTrait ? foundTrait.desc : "Effet ou règle standard de cette arme.";
            return `
                <div style="background:#131822; border-left:3px solid var(--accent-cyan); padding:8px 10px; margin-bottom:6px; border-radius:0 4px 4px 0; font-size:12px;">
                    <strong style="color:var(--accent-cyan);">${foundTrait ? foundTrait.name : t} :</strong> <span style="color:#ddd;">${desc}</span>
                </div>
            `;
        }).join('');
    }

    let accHTML = '';
    if (w.accessory) {
        let accName = (typeof w.accessory === 'object') ? w.accessory.name : w.accessory;
        let accEffect = (typeof w.accessory === 'object' && w.accessory.effect) ? w.accessory.effect : '';
        if (!accEffect && typeof db !== 'undefined' && db.equipment) {
            let foundAcc = db.equipment.find(e => e.name.toLowerCase() === String(accName).toLowerCase());
            if (foundAcc && foundAcc.effect) accEffect = foundAcc.effect;
        }
        accHTML = `
            <div style="background:#0f2119; border:1px solid #10b981; border-radius:6px; padding:10px 12px; margin-top:12px;">
                <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#10b981; font-weight:bold;">
                    Accessoire monté
                </div>
                <strong style="color:#fff; font-size:14px;">${escapeHtml(accName)}</strong><br>
                <span style="font-size:12px; color:#a8e6cf; line-height:1.4;">${accEffect || 'Accessoire d\'arme.'}</span>
            </div>
        `;
    }

    let costVal = w.cost_credits !== undefined ? w.cost_credits : (w.cost || 0);

    let html = `
        <div style="padding:2px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:8px; margin-bottom:10px;">
                <h3 style="margin:0; color:var(--accent-cyan); font-size:18px;">${escapeHtml(w.name)}</h3>
                <span style="background:#1a212d; border:1px solid var(--accent-cyan); color:#fff; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:bold;">
                    ${costVal} crédits
                </span>
            </div>

            ${profiles.length > 0 ? `
                <div style="overflow-x:auto; margin-bottom:12px;">
                    <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:center; background:#0e1117; border-radius:4px; overflow:hidden;">
                        <thead>
                            <tr style="background:#161d28; color:var(--accent-cyan);">
                                <th style="padding:6px 8px; border:1px solid #28313e; text-align:left;">Profil</th>
                                <th style="padding:6px 4px; border:1px solid #28313e;">Portée C</th>
                                <th style="padding:6px 4px; border:1px solid #28313e;">Portée L</th>
                                <th style="padding:6px 4px; border:1px solid #28313e;">Force</th>
                                <th style="padding:6px 4px; border:1px solid #28313e;">AP</th>
                                <th style="padding:6px 4px; border:1px solid #28313e;">Dégâts</th>
                                <th style="padding:6px 8px; border:1px solid #28313e; text-align:left;">Traits</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${profiles.map(p => `
                                <tr>
                                    <td style="padding:6px 8px; border:1px solid #202733; text-align:left; font-weight:bold; color:#fff;">${p.name || 'Unique'}</td>
                                    <td style="padding:6px 4px; border:1px solid #202733; color:#ddd;">${p.SR || '-'}</td>
                                    <td style="padding:6px 4px; border:1px solid #202733; color:#ddd;">${p.LR || '-'}</td>
                                    <td style="padding:6px 4px; border:1px solid #202733; color:#ddd;">${p.S || '-'}</td>
                                    <td style="padding:6px 4px; border:1px solid #202733; color:#ddd;">${p.AP || '-'}</td>
                                    <td style="padding:6px 4px; border:1px solid #202733; color:#ddd;">${p.L || 1}</td>
                                    <td style="padding:6px 8px; border:1px solid #202733; text-align:left; color:#fdba74;">${p.traits || '—'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="color:#888; font-style:italic; font-size:13px;">Profil d\'arme de corps à corps ou standard.</p>'}

            ${accHTML}

            ${traitsDescHTML ? `
                <div style="margin-top:12px;">
                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#fdba74; font-weight:bold; margin-bottom:6px;">
                        Effet des Traits d'arme :
                    </div>
                    ${traitsDescHTML}
                </div>
            ` : ''}

            <div style="margin-top:14px; text-align:right;">
                <button class="btn btn-cyan" onclick="closeModal()">Fermer</button>
            </div>
        </div>
    `;

    openModal(`Arme : ${w.name}`, html);
}
window.showWeaponInfoModal = showWeaponInfoModal;

function showAccessoryInfoModal(accName) {
    if (!accName) return;
    let acc = null;
    if (typeof db !== 'undefined' && db.equipment) {
        acc = db.equipment.find(e => e.name.toLowerCase() === accName.toLowerCase());
    }

    let effect = acc ? acc.effect : "Accessoire fixé sur une arme.";
    let cost = acc ? (acc.cost_credits || acc.cost || 0) : 0;
    let ruleDesc = (typeof db !== 'undefined' && db.accessory_rules && db.accessory_rules.desc) 
        ? db.accessory_rules.desc 
        : "Chaque arme ne peut recevoir qu'un seul accessoire. Si une arme est déséquipée et envoyée dans le stash, son accessoire aussi.";

    let html = `
        <div style="padding:2px;">
            <div style="background:#0f241a; border:1px solid #10b981; border-radius:6px; padding:14px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#10b981; font-weight:bold;">
                        Accessoire d'Arme
                    </span>
                    ${cost > 0 ? `<span style="background:#1b3d2b; color:#a8e6cf; border:1px solid #10b981; font-size:11px; padding:2px 8px; border-radius:4px; font-weight:bold;">${cost} cr</span>` : ''}
                </div>
                <h3 style="margin:0 0 8px 0; color:#fff; font-size:18px;">${escapeHtml(accName)}</h3>
                <p style="margin:0; font-size:14px; line-height:1.5; color:#eee;">${effect}</p>
            </div>

            <div style="background:#141820; border:1px solid #333; border-radius:6px; padding:10px 12px; margin-bottom:12px; font-size:12px; color:#bbb; line-height:1.5;">
                <strong style="color:var(--accent-cyan);">Règle des Accessoires :</strong><br>
                ${ruleDesc}
            </div>

            <div style="text-align:right;">
                <button class="btn btn-cyan" onclick="closeModal()">Fermer</button>
            </div>
        </div>
    `;

    openModal(`Accessoire : ${accName}`, html);
}
window.showAccessoryInfoModal = showAccessoryInfoModal;

function showEquipmentInfoModal(equipName, fighterIdx) {
    if (!equipName) return;
    let fighter = (currentGang && currentGang.members && fighterIdx !== undefined) ? currentGang.members[fighterIdx] : null;
    let item = null;

    if (fighter) {
        if (fighter.armor && fighter.armor.name && fighter.armor.name.toLowerCase() === equipName.toLowerCase()) {
            item = fighter.armor;
        }
        if (!item && fighter.equipment) {
            item = fighter.equipment.find(e => e.name.toLowerCase() === equipName.toLowerCase() || e.id === equipName);
        }
    }

    if (!item && typeof db !== 'undefined' && db.equipment) {
        item = db.equipment.find(e => e.name.toLowerCase() === equipName.toLowerCase() || e.id === equipName);
    }
    if (!item && typeof db !== 'undefined' && db.weapons) {
        item = db.weapons.find(w => w.name.toLowerCase() === equipName.toLowerCase() || w.id === equipName);
    }

    if (!item) {
        return openModal(`Équipement : ${equipName}`, `<p style="padding:10px; color:#aaa;">Informations non disponibles pour cet équipement.</p>`);
    }

    let isGrenade = item.counts_as_equip || item.type === 'Grenade' || (item.id && (item.id.startsWith('wpn_grenade_') || item.id === 'wpn_charge_demo')) || (item.profiles && item.profiles.length > 0);
    let profiles = item.profiles || [];
    if (isGrenade && profiles.length === 0 && typeof db !== 'undefined' && db.weapons) {
        let foundW = db.weapons.find(w => w.id === item.id || w.name === item.name);
        if (foundW && foundW.profiles) profiles = foundW.profiles;
    }

    let costVal = item.cost_credits !== undefined ? item.cost_credits : (item.cost || 0);
    let typeVal = item.type || (isGrenade ? 'Grenade' : 'Équipement');
    let effectVal = item.effect || (isGrenade ? "Grenade de combat projetée à la main ou via un lance-grenades." : "Équipement personnel standard.");

    let html = `
        <div style="padding:2px;">
            <div style="background:#221b10; border:1px solid #f59e0b; border-radius:6px; padding:14px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#f59e0b; font-weight:bold;">
                        ${typeVal}
                    </span>
                    ${costVal > 0 ? `<span style="background:#3d2f16; color:#fde68a; border:1px solid #f59e0b; font-size:11px; padding:2px 8px; border-radius:4px; font-weight:bold;">${costVal} cr</span>` : ''}
                </div>
                <h3 style="margin:0 0 8px 0; color:#fff; font-size:18px;">${escapeHtml(item.name)}</h3>
                <p style="margin:0; font-size:14px; line-height:1.5; color:#eee;">${effectVal}</p>
            </div>
            <div style="text-align:right;">
                <button class="btn btn-cyan" onclick="closeModal()">Fermer</button>
            </div>
        </div>
    `;

    openModal(`Équipement : ${item.name}`, html);
}
window.showEquipmentInfoModal = showEquipmentInfoModal;

function renderGangManage(container) {
    if (!container) container = document.getElementById('main-content');
    if (!container) return;

    ensureInnateFighterSkills(currentGang);
    calculateGangRating(currentGang);
    updateTopBar();

    const statKeys = ['M', 'WS', 'BS', 'S', 'T', 'W', 'I', 'A', 'Sv', 'Ld', 'Cl', 'Wil', 'Int'];
    const recoveringCount = (currentGang.members || []).filter(m => m.recovery).length;

    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
                <h2 style="margin:0;">Gang Delaque : ${escapeHtml(currentGang.name)}</h2>
                ${currentGang.isEstablished 
                    ? `<span style="font-size:13px; color:#10b981; background:rgba(16,185,129,0.15); border:1px solid #10b981; padding:4px 10px; border-radius:14px; font-weight:bold;">✓ Mode Campagne Validé</span>` 
                    : `<span style="font-size:13px; color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid #f59e0b; padding:4px 10px; border-radius:14px; font-weight:bold;">⏳ Création Initiale</span>`}
            </div>
            <div style="background:#0f131a; border:1px solid #242b38; border-radius:6px; padding:10px 12px; margin-bottom:12px; font-size:13px; color:#cbd5e1;">
                <strong style="color:var(--accent-cyan);">Règle d'armée Delaque — Psychoteric choir :</strong> Quand un guerrier Delaque se trouve à 3" ou moins de deux ou plus alliés Delaque, leur Ld et leur Will augmentent de 1.
            </div>
            ${!currentGang.isEstablished ? `<button onclick="openRecruitModal()">+ Recruter un Combattant</button>` : ''}
            <button onclick="openGangTacticsModal()">🎴 Cartes Tactiques (${(currentGang.tactics || []).length})</button>
            <button onclick="if(typeof resetSetupState === 'function') resetSetupState(); appState.isQuickMatch = false; navigate('game-setup')">⚔️ Partie de campagne</button>
            <button class="btn-cyan" onclick="if(typeof resetSetupState === 'function') resetSetupState(); appState.isQuickMatch = true; navigate('game-setup')">⚡ Partie rapide</button>
            <button onclick="if(typeof renderPostCycleView === 'function') { renderPostCycleView(document.getElementById('main-content')); }">🔄 Séquence Post-Cycle</button>
            ${recoveringCount > 0 ? `<button class="btn-cyan" onclick="startNewCycleDirectly()">⏩ Nouveau Cycle (Rétablir ${recoveringCount} Convalescent${recoveringCount > 1 ? 's' : ''})</button>` : ''}
            ${!currentGang.isEstablished ? `<button class="btn-cyan" onclick="finishGangCreation()">✅ Valider la création du gang</button>` : ''}
            <button onclick="exportGang('${escapeForJsStr(currentGang.name)}')">Export JSON</button>
            <button class="btn-danger" onclick="navigate('menu')">Menu Principal</button>
        </div>
        
        <div class="card">
            <h3>Membres du Gang (${currentGang.members.length})</h3>
    `;

    if (currentGang.members.length === 0) {
        html += `<p style="margin-top:10px;">Aucun membre recruté.</p>`;
    } else {
        currentGang.members.forEach((m, idx) => {
            let st = m.stats || {};
            let xp = (typeof getFighterXP === 'function') ? getFighterXP(m) : (m.xp || 0);

            // Compétences
            let skillsHTML = '';
            if (m.skills && m.skills.length > 0) {
                skillsHTML = m.skills.map(s => {
                    let sName = typeof s === 'string' ? s : (s.name || s.id);
                    return `<span class="tag-chip tag-skill" title="Cliquer pour voir la description" onclick="showSkillInfoModal('${escapeForJsStr(sName)}'); event.stopPropagation();">${escapeHtml(sName)}</span>`;
                }).join('');
            } else {
                skillsHTML = '<span style="color:#777; font-style:italic;">Aucune</span>';
            }

            // Armes
            let weaponsHTML = '';
            if (m.weapons && m.weapons.length > 0) {
                weaponsHTML = m.weapons.map(w => {
                    let wName = w.name;
                    let accName = null;
                    if (w.accessory) {
                        accName = (typeof w.accessory === 'object') ? w.accessory.name : w.accessory;
                    }
                    let wBadge = `<span class="tag-chip tag-weapon" title="Cliquer pour voir le profil et les règles" onclick="showWeaponInfoModal('${escapeForJsStr(wName)}', ${idx}); event.stopPropagation();">${escapeHtml(wName)}</span>`;
                    if (accName) {
                        let accBadge = `<span class="tag-chip tag-accessory" title="Cliquer pour voir l'effet de l'accessoire" onclick="showAccessoryInfoModal('${escapeForJsStr(accName)}'); event.stopPropagation();">${escapeHtml(accName)}</span>`;
                        return `${wBadge} <span style="color:#aaa; font-style:italic; margin:0 3px;">avec</span> ${accBadge}`;
                    }
                    return wBadge;
                }).join('<span style="color:#555; margin:0 4px;">,</span> ');
            } else {
                weaponsHTML = '<span style="color:#777; font-style:italic;">Aucune</span>';
            }

            // Équipements & Armures
            let allEquip = [];
            if (m.armor && m.armor.name) {
                allEquip.push({ name: m.armor.name });
            }
            if (m.equipment && Array.isArray(m.equipment)) {
                m.equipment.forEach(e => {
                    if (e && e.name) allEquip.push({ name: e.name });
                });
            }
            let equipmentHTML = '';
            if (allEquip.length > 0) {
                equipmentHTML = allEquip.map(eq => {
                    return `<span class="tag-chip tag-equip" title="Cliquer pour voir la règle détaillée" onclick="showEquipmentInfoModal('${escapeForJsStr(eq.name)}', ${idx}); event.stopPropagation();">${escapeHtml(eq.name)}</span>`;
                }).join('');
            } else {
                equipmentHTML = '<span style="color:#777; font-style:italic;">Aucun</span>';
            }
            
            html += `
            <div class="card" style="margin-top:12px; background:#10141c; border:1px solid #242b38; padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding-bottom:8px; border-bottom:1px solid #1e2532;">
                    <div style="font-size:14px; line-height:1.5;">
                        <strong style="color:#fff; font-size:16px;">${escapeHtml(m.customName || 'Sans nom')}</strong> 
                        <span style="color:#94a3b8; font-weight:normal;">(${escapeHtml(m.charName)})</span>
                        ${m.isWyrd ? `<span style="background:rgba(194,94,26,0.25); color:#fdba74; border:1px solid var(--accent-secondary); padding:1px 6px; border-radius:3px; font-size:11px; font-weight:bold; margin-left:6px;">🔮 Wyrd</span>` : ''}
                        <span style="color:#555; margin:0 6px;">—</span>
                        <span style="color:var(--accent-cyan); font-weight:bold;">${m.totalCost || m.cost || 0} cr</span>
                        <span style="color:#555; margin:0 6px;">|</span>
                        <span style="color:#94a3b8;">Type : <strong style="color:#eee;">${(m.type || []).join(', ')}</strong></span>
                        <span style="color:#555; margin:0 6px;">|</span>
                        <span style="color:#94a3b8;">XP : <strong style="color:var(--accent-cyan);">${xp}</strong></span>
                        ${m.recovery ? `<span class="tag-chip" style="background:#e67e22; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; margin-left:8px; cursor:pointer;" title="Cliquer pour rétablir ce guerrier de sa convalescence" onclick="clearFighterRecovery(${idx}); event.stopPropagation();">🩹 Recovery (Rétablir ✕)</span>` : ''}
                        ${m.critInj ? `<span style="background:#c0392b; color:#fff; padding:2px 7px; border-radius:4px; font-size:11px; font-weight:bold; margin-left:8px;">⚠️ Blessure Critique</span>` : ''}
                        ${(m.injuries && m.injuries.length > 0) ? `<span style="color:#ef4444; font-size:12px; margin-left:8px;">[Blessures : ${m.injuries.join(', ')}]</span>` : ''}
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        ${!currentGang.isEstablished ? `<button onclick="editFighter(${idx})" style="padding:6px 12px; font-size:12px; margin:0;">Équipement & Compétences</button>` : ''}
                        <button class="btn-danger" onclick="removeFighter(${idx})" style="padding:6px 12px; font-size:12px; margin:0;">Licencier</button>
                    </div>
                </div>

                <div style="margin:6px 0 10px 0; font-size:13px; line-height:1.6; display:flex; flex-wrap:wrap; align-items:center; gap:6px 18px;">
                    <div style="display:inline-flex; align-items:center; flex-wrap:wrap;">
                        <strong style="color:var(--accent-purple); margin-right:6px;">Compétences :</strong>
                        ${skillsHTML}
                    </div>
                    <div style="display:inline-flex; align-items:center; flex-wrap:wrap;">
                        <strong style="color:var(--accent-cyan); margin-right:6px;">Armes :</strong>
                        ${weaponsHTML}
                    </div>
                    <div style="display:inline-flex; align-items:center; flex-wrap:wrap;">
                        <strong style="color:#f59e0b; margin-right:6px;">Équipements :</strong>
                        ${equipmentHTML}
                    </div>
                </div>

                <div style="overflow-x:auto; background:#0b0d12; padding:8px; border-radius:4px; border:1px solid #1e2532;">
                    <div style="display:flex; justify-content:space-between; gap:4px; text-align:center; min-width:600px;">
                        ${statKeys.map(key => `
                            <div style="flex:1; background:#141820; padding:6px 2px; border-radius:3px; border:1px solid #1e2532;">
                                <small style="color:var(--accent-cyan); font-weight:bold; font-size:11px;">${key}</small>
                                <div style="font-weight:bold; font-size:13px; margin-top:2px; color:#fff;">${st[key] !== undefined ? st[key] : '-'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        });
    }
    html += `</div>`;
    container.innerHTML = html;
}

function finishGangCreation() {
    showConfirmModal(
        "Validation de la création du gang Delaque",
        `Confirmer la validation de la liste initiale pour <strong>${currentGang.name}</strong> et passer en mode <strong>Campagne</strong> ?<br><br>
        <div style="background:#0e1117; padding:12px; border-radius:6px; border:1px solid #242b38; font-size:13px; line-height:1.6; color:#ddd;">
            <span style="color:#10b981;">✓</span> Débloque le recrutement des mercenaires (Hive Scum, Luthern Armbot, etc.)<br>
            <span style="color:#10b981;">✓</span> Active la gestion des blessures durables, séquelles et gains d'XP<br>
            <span style="color:#10b981;">✓</span> Donne accès aux séquences de Post-Bataille et de Post-Cycle
        </div>`,
        "✅ Valider le Gang",
        () => {
            currentGang.isEstablished = true;
            saveGangs();
            renderGangManage(document.getElementById('main-content'));
            showToast("Le gang Delaque est désormais validé en mode Campagne !", "success");
        }
    );
}

// ==========================================
// FIGHTER EDITING & RECRUITMENT
// ==========================================
function openRecruitModal() {
    if (currentGang && currentGang.isEstablished && (typeof appState === 'undefined' || appState.returnTo !== 'post-cycle')) {
        showToast("Le recrutement de combattants est verrouillé une fois la création du gang validée. Utilisez le Post-Cycle.", "error");
        return;
    }
    let html = `<h3>Sélectionner le profil Delaque à recruter</h3>`;
    const showMercs = currentGang && (currentGang.isEstablished || (typeof appState !== 'undefined' && appState.returnTo === 'post-cycle'));
    if (currentGang && currentGang.credits !== undefined) {
        html += `<p style="color:#aaa; font-size:13px; margin-bottom:12px;">Trésorerie disponible : <strong style="color:var(--accent-cyan);">${currentGang.credits} cr</strong></p>`;
    }

    db.characters.forEach(c => {
        const isMerc = c.id.startsWith("merc_");
        if (isMerc && !showMercs) return;

        html += `
            <div class="fighter-item">
                <span><strong>${c.name}</strong> (${c.cost}c) ${isMerc ? '<small style="color:var(--accent-purple);">[Mercenaire/Hanger-on]</small>' : ''}</span>
                <button onclick="selectRecruitProfile('${c.id}')">Choisir</button>
            </div>
        `;
    });

    openModal("Recrutement Delaque", html);
}

function selectRecruitProfile(charId) {
    closeModal();
    const char = db.characters.find(c => c.id === charId);
    if (!char) return;

    let initSkills = [];

    // Compétence d'armée Psychoteric choir
    if (char.id.startsWith("char_")) {
        initSkills.push({
            id: "sk_psychoteric_choir",
            name: "Psychoteric choir",
            desc: "Quand un guerrier Delaque se trouve à 3\" ou moins de deux ou plus alliés Delaque, leur Ld et leur Will augmentent de 1."
        });
    }

    // Nacht-Ghul -> From the shadows
    if (char.id === "char_nacht_ghul") {
        initSkills.push({
            id: "sk_from_the_shadows",
            name: "From the shadows",
            desc: "Au lieu de déployer ce guerrier normalement, il peut être gardé de côté. Au début de n'importe quel round après le premier, avant le jet de priorité, il peut être déployé n'importe où sur le terrain, hors de ligne de vue et à plus de 9\" de tout ennemi.",
            specific_to: "char_nacht_ghul"
        });
    }

    // Cephalopod Spektor -> Sensor array & Leash 3"
    if (char.id === "char_cephalopod_spektor") {
        initSkills.push({
            id: "sk_sensor_array",
            name: "Sensor array",
            desc: "Si le Cephalopod Spektor est dans la distance de leash de son maitre quand celui-ci fait un test d'Int, celui-ci lance un dé de plus et garde le meilleur.",
            specific_to: "char_cephalopod_spektor"
        });
        initSkills.push({
            id: "sk_leash_3",
            name: "Leash de 3\"",
            desc: "Distance de liaison avec son maître."
        });
    }

    // Psychoteric wyrm -> Psychoteric node, Burrowing & Leash 12"
    if (char.id === "char_psychoteric_wyrm") {
        initSkills.push({
            id: "sk_psychoteric_node",
            name: "Psychoteric node",
            desc: "Quand son maitre utilise un pouvoir psychoteric wyrd en étant à portée de leash, il peut lancer son pouvoir depuis le psychoteric wyrm.",
            specific_to: "char_psychoteric_wyrm"
        });
        initSkills.push({
            id: "sk_burrowing",
            name: "Burrowing",
            desc: "Peut se déplacer sous les terrains infranchissables.",
            specific_to: "char_psychoteric_wyrm"
        });
        initSkills.push({
            id: "sk_leash_12",
            name: "Leash de 12\"",
            desc: "Distance de liaison avec son maître."
        });
    }

    // Brute -> Juggernaut
    const isBruteChar = (char.type && Array.isArray(char.type) && char.type.some(t => String(t).toLowerCase() === 'brute'));
    if (isBruteChar) {
        initSkills.push({
            id: "sk_juggernaut",
            name: "Juggernaut",
            desc: "Si touché au tir, suppressed uniquement si PV perdu ou effet du dé de blessure.",
            specific_to: "brute"
        });
    }

    let initWeapons = [];
    if (char.default_weapons) {
        char.default_weapons.forEach(wId => {
            let wObj = db.weapons.find(w => w.id === wId || w.name === wId);
            if (wObj) {
                let item = JSON.parse(JSON.stringify(wObj));
                item.isDefault = true;
                initWeapons.push(item);
            }
        });
    }

    let initEquip = [];
    if (char.default_equipment) {
        char.default_equipment.forEach(eId => {
            let eObj = db.equipment.find(e => e.id === eId || e.name === eId);
            if (eObj) {
                let item = JSON.parse(JSON.stringify(eObj));
                item.isDefault = true;
                initEquip.push(item);
            }
        });
    }

    let isWyrdInitial = (char.id === 'char_psy_gheist' || char.id === 'char_piscean_spektor');

    tempFighter = {
        id: generateId(),
        charId: char.id,
        charName: char.name,
        customName: "",
        type: [...char.type],
        stats: JSON.parse(JSON.stringify(char.stats)),
        weapons: initWeapons,
        equipment: initEquip,
        skills: initSkills,
        totalCost: char.cost,
        xp: char.starting_xp || 0,
        isWyrd: isWyrdInitial,
        cannot_buy_gear: char.cannot_buy_gear || false
    };
    appState.editTarget = null;
    navigate('fighter-edit');
}

function editFighter(idx) {
    if (currentGang && currentGang.isEstablished && (typeof appState === 'undefined' || appState.returnTo !== 'post-cycle')) {
        showToast("La modification d'un combattant est verrouillée une fois la création du gang validée. Utilisez le Post-Cycle.", "error");
        return;
    }
    appState.editTarget = idx;
    tempFighter = JSON.parse(JSON.stringify(currentGang.members[idx]));
    navigate('fighter-edit');
}

function toggleWyrdOption(isChecked) {
    if (!tempFighter) return;
    tempFighter.isWyrd = isChecked;
    if (!tempFighter.type) tempFighter.type = [];
    
    if (isChecked) {
        if (!tempFighter.type.map(t => t.toLowerCase()).includes("wyrd")) {
            tempFighter.type.push("wyrd");
        }
    } else {
        tempFighter.type = tempFighter.type.filter(t => t.toLowerCase() !== "wyrd");
        // Retirer les compétences psychoteric wyrd si décoché
        if (tempFighter.skills && db.skills["psychoteric wyrd"]) {
            let wyrdIds = db.skills["psychoteric wyrd"].map(s => s.id);
            tempFighter.skills = tempFighter.skills.filter(s => !wyrdIds.includes(s.id));
        }
    }
    tempFighter.totalCost = calculateFighterCost(tempFighter);
    renderFighterEdit(document.getElementById('main-content'));
}

function renderFighterEdit(container) {
    const m = tempFighter;
    m.totalCost = calculateFighterCost(m);

    let types = (m.type || []).map(t => t.toLowerCase());
    let isBeast = types.includes("bête") || types.includes("bette");
    let isMerc = m.charId && m.charId.startsWith("merc_");
    let isHiveScum = m.charId === "merc_hive_scum";
    let isLockedBeast = isLockedDelaqueBeast(m);
    let canBeWyrd = (m.charId === 'char_master_of_shadow' || m.charId === 'char_phantom');
    let usedSlots = (m.weapons || []).reduce((sum, w) => sum + getWeaponSlotCost(w), 0);

    let isPostCycleEquip = (appState.returnTo === 'post-cycle' && appState.editTarget !== null);
    let isPostCycleRecruit = (appState.returnTo === 'post-cycle' && appState.editTarget === null);

    let html = `
        <div class="card">
            <h2>${isPostCycleEquip ? 'Équipement — ' + (m.customName || m.charName) : (appState.editTarget === null ? 'Recruter : ' + m.charName : 'Modifier ' + (m.customName || m.charName))} <small style="font-size:14px; color:#aaa;">(${m.charName})</small></h2>
            
            <label>Nom personnalisable :</label>
            <input type="text" value="${m.customName}" placeholder="Ex: Yharon the Silent" oninput="tempFighter.customName = this.value">
            
            ${canBeWyrd ? `
                <div style="background:#151824; border:1px solid var(--accent-purple); border-radius:6px; padding:10px 14px; margin:12px 0;">
                    <label style="cursor:pointer; display:flex; align-items:center; gap:10px; font-weight:bold; color:var(--accent-cyan);">
                        <input type="checkbox" style="transform:scale(1.3); cursor:pointer;" ${m.isWyrd ? 'checked' : ''} onchange="toggleWyrdOption(this.checked)">
                        🔮 Option Wyrd (+35 crédits)
                    </label>
                    <p style="font-size:12px; color:#fdba74; margin:6px 0 0 24px; line-height:1.4;">
                        Le guerrier gagne le type <strong>wyrd</strong>, augmente son coût de +35 crédits et accède à la catégorie primaire <strong>Psychoteric wyrd</strong>. Il peut sélectionner un pouvoir dans cette liste en plus de sa compétence primaire de départ !
                    </p>
                </div>
            ` : ''}

            ${isLockedBeast ? `
                <div style="background:#131822; border:1px solid #242b38; border-radius:6px; padding:10px 14px; margin:12px 0; color:#94a3b8; font-size:13px;">
                    💡 <strong>Profil Verrouillé :</strong> Cette créature possède ses armes de départ uniques et ne peut jamais acheter d'arme, d'armure, d'équipement ou d'accessoire d'arme.
                </div>
            ` : ''}

            <h3>Armes Équipées <span style="font-size:12px; font-weight:normal; color:#888;">(Emplacements : ${usedSlots} / 3)</span></h3>
            <div id="weapon-list">
                ${m.weapons.length === 0 ? '<p>Aucune arme.</p>' : m.weapons.map((w, i) => {
                    let prof = (w.profiles && w.profiles[0]) ? w.profiles[0] : null;
                    let statsText = prof ? `Portée: ${prof.SR}/${prof.LR} | F:${prof.S} | AP:${prof.AP} | D:${prof.L}${prof.traits ? ` | ${prof.traits}` : ''}` : '';
                    let slotCost = getWeaponSlotCost(w);
                    let isTwoSlots = w.name && w.name.includes('*');

                    return `
                    <div style="margin:8px 0; background:#141820; padding:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            • <strong>${w.name}</strong> (${w.cost_credits||0}c) ${isTwoSlots ? `<span style="color:var(--accent-purple); font-size:11px; margin-left:6px;">(${slotCost === 1 ? '1 emp. grâce aux Suspensors' : '2 emplacements'})</span>` : ''}
                            ${statsText ? `<br><small style="color:#aaa; font-size:11px; margin-left:12px;">${statsText}</small>` : ''}
                            ${w.accessory ? `<br><small style="color:var(--accent-cyan); margin-left:12px;">↳ Accessoire (1 max) : ${w.accessory.name} ${w.accessory.effect ? `— <em>${w.accessory.effect}</em>` : ''} ${w.accessory.fromStash ? '<span style="color:#10b981;">(Réserve - 0c)</span>' : `(${w.accessory.cost_credits||0}c)`} ${!isLockedBeast && !isBeast && (!isMerc || isHiveScum) ? `<button class="btn-danger" style="padding:2px 6px; font-size:10px; margin-left:5px;" onclick="removeWeaponAccessory(${i})">Retirer accessoire</button>` : ''}</small>` : (!isLockedBeast && !isBeast && (!isMerc || isHiveScum) ? `<br><button style="padding:2px 6px; font-size:11px; margin-left:12px; margin-top:4px;" onclick="openWeaponAccessoryModal(${i})">+ Ajouter un accessoire (1 max)</button>` : '')}
                        </div>
                        ${!isLockedBeast ? `<button class="btn-danger" style="padding:2px 6px; font-size:11px; flex-shrink:0;" onclick="removeWeapon(${i})">Supprimer</button>` : ''}
                    </div>
                    `;
                }).join('')}
            </div>
            ${!isLockedBeast ? `<button onclick="openWeaponSelectModal()">+ Ajouter / Échanger une Arme</button>` : ''}

            <h3 style="margin-top:15px;">Armures & Équipements</h3>
            <div id="equip-list">
                ${m.equipment.length === 0 ? '<p>Aucun équipement.</p>' : m.equipment.map((e, i) => {
                    let isGrenade = e.counts_as_equip || e.type === 'Grenade' || (e.id && (e.id.startsWith('wpn_grenade_') || e.id === 'wpn_charge_demo')) || (e.profiles && e.profiles.length > 0);
                    let prof = (e.profiles && e.profiles[0]) ? e.profiles[0] : null;
                    let statsText = prof ? `Portée: ${prof.SR}/${prof.LR} | F:${prof.S} | AP:${prof.AP} | D:${prof.L}${prof.traits ? ` | ${prof.traits}` : ''}` : '';
                    return `
                    <div style="margin:6px 0; background:#141820; padding:6px 8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            • <strong>${e.name}</strong> ${isGrenade ? `<span style="color:var(--accent-purple); font-size:11px; margin-left:4px; font-weight:bold; background:rgba(112,88,166,0.2); padding:1px 5px; border-radius:3px;">Grenade</span>` : ''} ${e.fromStash ? '<span style="color:#10b981;">(Réserve)</span>' : `(${e.cost_credits||e.cost||0}c)`}
                            ${statsText ? `<br><small style="color:#aaa; font-size:11px; margin-left:12px;">${statsText}</small>` : ''}
                            ${e.effect ? `<br><small style="color:#aaa; font-size:11px; margin-left:12px;">${e.effect}</small>` : ''}
                        </div>
                        ${!isLockedBeast ? `<button class="btn-danger" style="padding:2px 6px; font-size:11px;" onclick="removeEquipment(${i})">X</button>` : ''}
                    </div>
                    `;
                }).join('')}
            </div>
            ${!isLockedBeast ? `<button onclick="openEquipSelectModal()">+ Ajouter Armure / Équipement / Grenade</button>` : ''}

            <h3 style="margin-top:15px;">Compétences & Pouvoirs</h3>
            <div id="skills-list">
                ${m.skills.length === 0 ? '<p>Aucune compétence sélectionnée.</p>' : m.skills.map((s, i) => {
                    let sName = typeof s === 'string' ? s : s.name;
                    let sDesc = (typeof s === 'object' && s.desc) ? s.desc : '';
                    let isInnate = (s.id === 'sk_psychoteric_choir' || s.id === 'sk_from_the_shadows' || s.id === 'sk_sensor_array' || s.id === 'sk_psychoteric_node' || s.id === 'sk_burrowing' || s.id === 'sk_juggernaut' || (s.id && s.id.startsWith('sk_leash')));
                    return `
                    <div style="margin:6px 0; background:#141820; padding:6px 8px; border-radius:4px; display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            • <strong>${sName}</strong> ${isInnate ? '<span style="color:var(--accent-purple); font-size:11px; font-weight:bold; margin-left:6px;">[Innée]</span>' : ''}
                            ${sDesc ? `<br><small style="color:#aaa; font-size:11px; margin-left:12px;">${sDesc}</small>` : ''}
                        </div>
                        ${(!isInnate && !isPostCycleEquip) ? `<button class="btn-danger" style="padding:2px 6px; font-size:11px; flex-shrink:0;" onclick="removeSkill(${i})">X</button>` : ''}
                    </div>
                    `;
                }).join('')}
            </div>
            ${!isPostCycleEquip ? `<button onclick="openSkillModal()">Gérer les Compétences & Pouvoirs</button>` : ''}

            <hr style="margin:20px 0; border-color:var(--border-color);">
            <p><strong>Valeur du Combattant (Rating) : ${m.totalCost} crédits</strong></p>
            <button onclick="saveFighter()">${isPostCycleRecruit ? 'Recruter et Revenir au Post-Cycle' : (isPostCycleEquip ? 'Valider et Revenir au Post-Cycle' : 'Valider et Enregistrer')}</button>
            <button class="btn-danger" onclick="cancelFighterEdit()">${appState.returnTo === 'post-cycle' ? 'Annuler et Revenir au Post-Cycle' : 'Annuler'}</button>
        </div>
    `;
    container.innerHTML = html;
}

// ==========================================
// SELECTION ET GESTION DES ARMES
// ==========================================
function openWeaponSelectModal() {
    let usedSlots = tempFighter.weapons.reduce((sum, w) => sum + getWeaponSlotCost(w), 0);
    let html = `<p>Emplacements utilisés : ${usedSlots} / 3</p><br>`;

    const isCampaign = currentGang && currentGang.isEstablished;
    let isMercOrBeast = isMercOrBeastProfile(tempFighter);
    let isHiveScum = tempFighter.charId === "merc_hive_scum";
    const charDef = db.characters.find(c => c.id === tempFighter.charId);

    if (isCampaign && !isHiveScum && !isMercOrBeast) {
        html += `<h4 style="color:var(--accent-cyan);">1. Réserve du Gang (Stash) :</h4>`;
        if (!currentGang.stash) currentGang.stash = [];

        let availableWeapons = currentGang.stash.filter(item => {
            let itemType = (typeof item === 'object' && item.type) ? item.type : 'Arme';
            let isGrenade = (typeof item === 'object' && (item.counts_as_equip || item.type === 'Grenade' || (item.id && (item.id.startsWith('wpn_grenade_') || item.id === 'wpn_charge_demo'))));
            if (itemType !== 'Arme' || isGrenade) return false;
            let dbW = db.weapons.find(w => w.name === item.name || w.id === item.id);
            if (dbW && dbW.associated_to && Array.isArray(dbW.associated_to) && !dbW.associated_to.includes(tempFighter.charId)) {
                return false;
            }
            return true;
        });

        if (availableWeapons.length === 0) {
            html += `<p style="color:#888; font-size:12px;">Aucune arme disponible dans la réserve.</p>`;
        } else {
            availableWeapons.forEach(w => {
                let slotsNeeded = (w.name && w.name.includes('*')) ? 2 : 1;
                let isAvailable = (usedSlots + slotsNeeded <= 3);
                let cleanName = (w.name || '').replace(/'/g, "\\'");

                html += `
                    <div class="fighter-item ${!isAvailable ? 'disabled' : ''}">
                        <div>
                            <strong>${w.name}</strong> (${w.cost_credits||0}c) ${slotsNeeded === 2 ? '<em>(2 emplacements)</em>' : ''}
                        </div>
                        ${isAvailable ? `<button class="btn-cyan" onclick="addWeaponFromStash('${cleanName}')">Équiper (Gratuit)</button>` : '<small>Emplacements insuffisants</small>'}
                    </div>
                `;
            });
        }
        html += `<hr style="margin:15px 0; border-color:#333;"><h4 style="color:var(--accent-purple);">2. Acheter sur la Liste de Clan :</h4>`;
    }

    const availableWeapons = db.weapons.filter(w => {
        if (w.counts_as_equip || w.type === "Grenade" || (w.id && (w.id.startsWith('wpn_grenade_') || w.id === 'wpn_charge_demo'))) return false;

        // Armes associées : strictement réservées aux figurines spécifiées (masquées pour toutes les autres)
        if (w.associated_to && Array.isArray(w.associated_to)) {
            if (!w.associated_to.includes(tempFighter.charId)) return false;
            return true;
        }

        if (w.specific_to && w.specific_to !== tempFighter.charId) return false;
        if (w.default_for && w.default_for !== tempFighter.charId) return false;
        if (isMercOrBeast) return w.specific_to === tempFighter.charId;
        if (isHiveScum) return w.is_hive_scum === true;
        if (w.is_merc_weapon) return false;
        return w.is_gang_weapon === true || w.is_gang === true;
    });

    if (availableWeapons.length === 0) {
        html += `<p style="color:#888; font-size:12px;">Aucune arme disponible pour ce combattant.</p>`;
    } else {
        availableWeapons.forEach(w => {
            let slotsNeeded = w.name.includes('*') ? 2 : 1;
            let isAvailable = (usedSlots + slotsNeeded <= 3);

            html += `
                <div class="fighter-item ${!isAvailable ? 'disabled' : ''}">
                    <div>
                        <strong>${w.name}</strong> (${w.cost_credits||0}c) ${slotsNeeded === 2 ? '<em>(2 emplacements)</em>' : ''}
                    </div>
                    ${isAvailable ? `<button onclick="addWeapon('${w.id}')">${isCampaign ? 'Acheter' : 'Ajouter'}</button>` : '<small>Emplacements insuffisants</small>'}
                </div>
            `;
        });
    }

    openModal("Sélection d'Arme", html);
}

function addWeapon(wId) {
    const w = db.weapons.find(item => item.id === wId);
    if (!w) return;
    let newWeapon = JSON.parse(JSON.stringify(w));
    newWeapon.accessory = null;
    tempFighter.weapons.push(newWeapon);
    closeModal();
    renderFighterEdit(document.getElementById('main-content'));
}

function addWeaponFromStash(itemName) {
    if (!currentGang || !currentGang.stash) return;

    let sIdx = currentGang.stash.findIndex(item => (typeof item === 'string' ? item : item.name) === itemName);
    if (sIdx >= 0) {
        currentGang.stash.splice(sIdx, 1);
        let foundDbW = db.weapons.find(w => w.name === itemName);
        let newWeapon = foundDbW ? JSON.parse(JSON.stringify(foundDbW)) : { name: itemName, cost_credits: 0 };
        newWeapon.accessory = null;
        newWeapon.fromStash = true;
        tempFighter.weapons.push(newWeapon);
        saveGangs();
    }
    closeModal();
    renderFighterEdit(document.getElementById('main-content'));
}

function removeWeapon(idx) {
    let w = tempFighter.weapons[idx];
    const charDef = db.characters.find(c => c.id === tempFighter.charId);
    const isMercOrBeast = isMercOrBeastProfile(tempFighter);
    const isDefault = w.isDefault || (charDef && charDef.default_weapons && (charDef.default_weapons.includes(w.id) || charDef.default_weapons.includes(w.name)));

    if (currentGang && currentGang.isEstablished && !isDefault && !isMercOrBeast) {
        if (!currentGang.stash) currentGang.stash = [];
        if (w.accessory) {
            currentGang.stash.push({ name: w.accessory.name, type: "Accessoire", cost: w.accessory.cost_credits || w.accessory.cost || 0 });
        }
        currentGang.stash.push({ name: w.name, type: "Arme", cost: w.cost_credits || 0 });
        saveGangs();
        showToast(`Arme "${w.name}" envoyée dans la réserve.`);
    }

    tempFighter.weapons.splice(idx, 1);
    renderFighterEdit(document.getElementById('main-content'));
}

function cancelFighterEdit() {
    if (appState.returnTo === 'post-cycle') {
        appState.returnTo = null;
        if (typeof renderPostCycleView === 'function') {
            renderPostCycleView(document.getElementById('main-content'));
        } else {
            navigate('gang-manage');
        }
    } else {
        navigate('gang-manage');
    }
}

// ==========================================
// GESTION DES ACCESSOIRES D'ARMES
// ==========================================
function openWeaponAccessoryModal(weaponIdx) {
    const weapon = tempFighter.weapons[weaponIdx];
    if (!weapon) return;

    let html = `
        <p>Arme concernée : <strong>${weapon.name}</strong></p>
        <p style="font-size:12px; color:#aaa; margin-top:2px; margin-bottom:12px;"><em>Règle : Chaque arme ne peut recevoir qu'un seul accessoire. Si une arme est déséquipée et envoyée dans le stash, son accessoire aussi.</em></p>
    `;

    if (weapon.accessory) {
        html += `
            <div style="background:#221818; border:1px solid #c0392b; border-radius:4px; padding:12px; margin-bottom:15px;">
                <p style="color:#ef4444; font-weight:bold; margin-bottom:6px;">⚠️ Cette arme possède déjà un accessoire équipé :</p>
                <p style="margin-left:10px;">• <strong>${weapon.accessory.name}</strong></p>
                <button class="btn-danger" style="margin-top:10px; padding:5px 12px;" onclick="removeWeaponAccessory(${weaponIdx}); openWeaponAccessoryModal(${weaponIdx});">Retirer l'accessoire actuel</button>
            </div>
        `;
        openModal(`Accessoire pour ${weapon.name}`, html);
        return;
    }

    let isHiveScum = tempFighter.charId === "merc_hive_scum";
    let availableAccessories = db.equipment.filter(e => {
        let eType = (e.type || '').toLowerCase();
        if (!eType.includes('accessoire')) return false;
        if (e.specific_to && e.specific_to !== tempFighter.charId) return false;
        if (isHiveScum) return e.is_hive_scum === true;
        return e.is_gang === true || e.is_gang_weapon === true;
    });

    availableAccessories.forEach(acc => {
        let cost = acc.cost_credits || 0;
        html += `
            <div class="fighter-item">
                <span><strong>${acc.name}</strong> (${cost}c) - <small style="color:#aaa;">${acc.effect || ''}</small></span>
                <button onclick="addWeaponAccessory(${weaponIdx}, '${acc.id}')">Équiper</button>
            </div>
        `;
    });

    openModal(`Accessoire pour ${weapon.name}`, html);
}

function addWeaponAccessory(weaponIdx, accId) {
    if (!tempFighter || !tempFighter.weapons || !tempFighter.weapons[weaponIdx]) return;
    const acc = db.equipment.find(e => e.id === accId || e.name === accId);
    if (!acc) return;

    let newAcc = JSON.parse(JSON.stringify(acc));
    tempFighter.weapons[weaponIdx].accessory = newAcc;
    closeModal();
    renderFighterEdit(document.getElementById('main-content'));
}

function removeWeaponAccessory(weaponIdx) {
    let weapon = tempFighter.weapons[weaponIdx];
    if (!weapon || !weapon.accessory) return;
    weapon.accessory = null;
    renderFighterEdit(document.getElementById('main-content'));
}

// ==========================================
// SELECTION ET GESTION DES ARMURES & EQUIPEMENTS
// ==========================================
function openEquipSelectModal() {
    let html = `<h4 style="color:var(--accent-purple);">Matériel Disponible :</h4>`;
    let isHiveScum = tempFighter.charId === "merc_hive_scum";
    let generalEquipments = db.equipment.filter(e => {
        if (e.type === "Accessoire") return false;
        if (e.specific_to && e.specific_to !== tempFighter.charId) return false;
        if (isHiveScum) return e.is_hive_scum === true;
        return e.is_gang === true || e.is_gang_weapon === true;
    });

    let availableGrenades = db.weapons.filter(w => {
        let isGrenade = w.counts_as_equip || w.type === "Grenade" || (w.id && (w.id.startsWith('wpn_grenade_') || w.id === 'wpn_charge_demo'));
        if (!isGrenade) return false;
        if (isHiveScum) return w.is_hive_scum === true;
        return w.is_gang_weapon === true || w.is_gang === true;
    });

    generalEquipments.forEach(e => {
        html += `
            <div class="fighter-item">
                <div>
                    <strong>${e.name}</strong> (${e.cost_credits||0}c) - <small style="color:var(--accent-purple);">${e.type}</small>
                </div>
                <button onclick="addEquipment('${e.id}')">Équiper</button>
            </div>
        `;
    });

    if (availableGrenades.length > 0) {
        html += `<h4 style="color:var(--accent-purple); margin-top:15px;">Grenades Disponibles :</h4>`;
        availableGrenades.forEach(g => {
            html += `
                <div class="fighter-item">
                    <div>
                        <strong>${g.name}</strong> (${g.cost_credits||0}c) - <small style="color:var(--accent-purple);">Grenade</small>
                    </div>
                    <button onclick="addEquipment('${g.id}')">Équiper</button>
                </div>
            `;
        });
    }

    openModal("Sélection Armure / Équipement", html);
}

function addEquipment(eId) {
    let e = db.equipment.find(item => item.id === eId);
    if (!e && db.weapons) e = db.weapons.find(item => item.id === eId);
    if (!e) return;

    let newE = JSON.parse(JSON.stringify(e));
    tempFighter.equipment.push(newE);
    closeModal();
    renderFighterEdit(document.getElementById('main-content'));
}

function removeEquipment(idx) {
    tempFighter.equipment.splice(idx, 1);
    renderFighterEdit(document.getElementById('main-content'));
}

// ==========================================
// GESTION DES COMPÉTENCES (CRÉATION)
// ==========================================
function openSkillModal() {
    if (!tempFighter) return;
    const char = db.characters.find(c => c.id === tempFighter.charId);
    if (!char) return;

    let types = (tempFighter.type || char.type || []).map(t => t.toLowerCase());
    let isLeaderOrChampion = types.includes("leader") || types.includes("champion");
    let isSpecialist = types.includes("spécialiste") || types.includes("specialiste");
    let isWyrd = tempFighter.isWyrd === true || types.includes("wyrd");

    const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    let primaryCats = (char.primary_skills || []).map(s => norm(s));
    let secondaryCats = (char.secondary_skills || []).map(s => norm(s));

    if (isWyrd && !primaryCats.includes("psychoteric wyrd")) {
        primaryCats.push("psychoteric wyrd");
    }

    const specialistSkillIds = [
        "sk_biceps_saillants", "sk_tir_hanche", "sk_pistolero", "sk_grimper",
        "sk_tir_precision", "sk_berserker", "sk_soin", "sk_munitions"
    ];

    let html = `<div style="max-height:60vh; overflow-y:auto;">`;

    if (isSpecialist) {
        html += `<p style="color:var(--accent-cyan); margin-bottom:10px;">
            🎯 <strong>Spécialiste :</strong> Choisissez 1 compétence parmi les 8 compétences des spécialistes ci-dessous :
        </p>`;

        for (let cat in db.skills) {
            db.skills[cat].forEach(s => {
                if (specialistSkillIds.includes(s.id)) {
                    let isChecked = tempFighter.skills.some(sk => sk.id === s.id);
                    html += `
                        <div class="skill-checkbox-group" style="margin-bottom:8px; padding:6px; background:#141820; border-radius:4px; border:1px solid #242b38;">
                            <input type="checkbox" id="sk-${s.id}" ${isChecked ? 'checked' : ''} onchange="toggleSpecialistSkill('${s.id}', '${cat}')">
                            <label for="sk-${s.id}"><strong>${s.name}</strong> (${cat.toUpperCase()}) : ${s.desc}</label>
                        </div>
                    `;
                }
            });
        }
    } else {
        if (isWyrd) {
            html += `<p style="color:#fdba74; background:#1e140d; border:1px solid var(--accent-secondary); padding:8px 12px; border-radius:6px; margin-bottom:12px; font-size:13px;">
                🔮 <strong>Combattant Wyrd :</strong> Vous avez accès à la catégorie primaire <strong>Psychoteric wyrd</strong>. Vous pouvez choisir un pouvoir psychoteric wyrd !
            </p>`;
        }

        for (let cat in db.skills) {
            if (cat === "generique") continue; // Innates
            let catNorm = norm(cat);
            let isPrimary = primaryCats.includes(catNorm);
            let isSecondary = secondaryCats.includes(catNorm);
            
            let isAllowed = true;
            if (isLeaderOrChampion) {
                isAllowed = isPrimary;
            } else if (types.includes("prospect") && !isWyrd) {
                isAllowed = false;
            } else if (types.includes("prospect") && isWyrd) {
                isAllowed = (catNorm === "psychoteric wyrd");
            } else if (types.includes("bête") && isWyrd) {
                isAllowed = (catNorm === "psychoteric wyrd");
            }

            html += `
                <div class="skill-category" style="margin-bottom:12px; ${isAllowed ? '' : 'opacity:0.35; pointer-events:none; filter:grayscale(1);'}">
                    <h4 style="margin-bottom:6px; color:${isPrimary ? 'var(--accent-cyan)' : (isSecondary ? 'var(--accent-purple)' : '#888')};">
                        Catégorie : ${cat.toUpperCase()} ${isPrimary ? '(Primaire)' : (isSecondary ? '(Secondaire)' : (isLeaderOrChampion ? '(Inaccessible)' : ''))}
                    </h4>
            `;

            db.skills[cat].forEach(s => {
                let isChecked = tempFighter.skills.some(sk => sk.id === s.id);
                html += `
                    <div class="skill-checkbox-group" style="margin-bottom:4px;">
                        <input type="checkbox" id="sk-${s.id}" ${isChecked ? 'checked' : ''} ${isAllowed ? '' : 'disabled'} onchange="toggleSkill('${cat}', '${s.id}')">
                        <label for="sk-${s.id}"><strong>${s.name}</strong> : ${s.desc}</label>
                    </div>
                `;
            });

            html += `</div>`;
        }
    }

    html += `</div><br><button class="btn" onclick="closeModal()">Fermer</button>`;
    openModal("Menu des Compétences & Pouvoirs Wyrd", html);
}

function toggleSpecialistSkill(skillId, cat) {
    const skillObj = db.skills[cat].find(s => s.id === skillId);
    if (!skillObj) return;

    const specialistSkillIds = [
        "sk_biceps_saillants", "sk_tir_hanche", "sk_pistolero", "sk_grimper",
        "sk_tir_precision", "sk_berserker", "sk_soin", "sk_munitions"
    ];

    tempFighter.skills = tempFighter.skills.filter(s => !specialistSkillIds.includes(s.id));

    let checkbox = document.getElementById(`sk-${skillId}`);
    if (checkbox && checkbox.checked) {
        tempFighter.skills.push(JSON.parse(JSON.stringify(skillObj)));
    }

    openSkillModal();
}

function toggleSkill(cat, skillId) {
    const skillObj = db.skills[cat].find(s => s.id === skillId);
    if (!skillObj) return;
    const existingIdx = tempFighter.skills.findIndex(s => s.id === skillId);
    
    if (existingIdx >= 0) {
        tempFighter.skills.splice(existingIdx, 1);
    } else {
        tempFighter.skills.push(JSON.parse(JSON.stringify(skillObj)));
    }
}

function removeSkill(idx) {
    tempFighter.skills.splice(idx, 1);
    renderFighterEdit(document.getElementById('main-content'));
}

// ==========================================
// SAUVEGARDE ET RENVOI DU COMBATTANT
// ==========================================
function saveFighter() {
    if (!tempFighter.customName.trim()) return alert("Veuillez saisir un nom pour le combattant.");
    
    tempFighter.totalCost = calculateFighterCost(tempFighter);

    if (!currentGang.isEstablished) {
        let oldCost = 0;
        if (appState.editTarget !== null) {
            oldCost = currentGang.members[appState.editTarget].totalCost;
        }
        let diff = tempFighter.totalCost - oldCost;
        if (currentGang.credits - diff < 0) return alert("Crédits insuffisants !");
        currentGang.credits -= diff;
    } else {
        let creditsToPay = 0;
        if (appState.editTarget === null) {
            const charDef = db.characters.find(c => c.id === tempFighter.charId);
            creditsToPay += (charDef ? charDef.cost : 0);
            if (tempFighter.isWyrd && (tempFighter.charId === 'char_master_of_shadow' || tempFighter.charId === 'char_phantom')) {
                creditsToPay += 35;
            }
            (tempFighter.weapons || []).forEach(w => {
                if (!w.fromStash && !w.isDefault) creditsToPay += (w.cost_credits || 0);
            });
            (tempFighter.equipment || []).forEach(e => {
                if (!e.fromStash && !e.isDefault) creditsToPay += (e.cost_credits || 0);
            });
        }
        if (creditsToPay > 0) {
            if (currentGang.credits < creditsToPay) {
                return alert(`Crédits insuffisants ! Requis : ${creditsToPay} cr | Disponibles : ${currentGang.credits} cr.`);
            }
            currentGang.credits -= creditsToPay;
        }
    }
    
    let wasRecruiting = (appState.editTarget === null);
    let recruitedFighter = tempFighter;
    let isPostCycle = (appState.returnTo === 'post-cycle');

    if (appState.editTarget === null) {
        currentGang.members.push(tempFighter);
    } else {
        currentGang.members[appState.editTarget] = tempFighter;
    }
    
    ensureInnateFighterSkills(currentGang);
    calculateGangRating(currentGang);
    saveGangs();

    if (isPostCycle) {
        appState.returnTo = null;
        appState.view = 'post-cycle';
        if (typeof renderPostCycleView === 'function') {
            renderPostCycleView(document.getElementById('main-content'));
        } else {
            navigate('gang-manage');
        }
    } else {
        navigate('gang-manage');
    }

    if (wasRecruiting) {
        handleRecruitTactics(recruitedFighter, isPostCycle);
    } else {
        showToast("Combattant mis à jour avec succès !", "success");
    }
}

function removeFighter(idx) {
    const m = currentGang.members[idx];
    if (!m) return;
    
    showConfirmModal(
        "Licencier le combattant",
        `Voulez-vous vraiment licencier <strong>${m.customName}</strong> (${m.charName}) ?<br><br>
        ${!currentGang.isEstablished 
            ? `<small style="color:#10b981; font-size:13px;">Le coût du combattant (+${m.totalCost} cr) sera remboursé dans la trésorerie du gang.</small>` 
            : `<small style="color:#aaa; font-size:13px;">Ses armes et équipements non-initiaux seront automatiquement transférés dans la réserve du gang.</small>`}`,
        "Licencier",
        () => {
            performRemoveFighter(idx);
        }
    );
}

function performRemoveFighter(idx) {
    const m = currentGang.members[idx];
    if (!m) return;

    if (!currentGang.isEstablished) {
        currentGang.credits += m.totalCost;
    }

    currentGang.members.splice(idx, 1);
    calculateGangRating(currentGang);
    saveGangs();
    renderGangManage(document.getElementById('main-content'));
    showToast(`${m.customName} a été licencié(e).`);
}

// ==========================================
// MODALE & UTILS EXPORT
// ==========================================
function openModal(title, content, isLandscape = false) {
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    const modalFooter = document.getElementById('modal-footer');

    if (modalTitle) modalTitle.innerText = title;
    if (modalBody) modalBody.innerHTML = content;
    
    if (modalContent) {
        if (isLandscape) modalContent.classList.add('modal-landscape');
        else modalContent.classList.remove('modal-landscape');
    }

    if (modalFooter && modalBody) {
        const hasExistingCloseBtn = modalBody.querySelector('button[onclick*="closeModal"]') !== null;
        modalFooter.style.display = hasExistingCloseBtn ? 'none' : 'flex';
    }

    if (modalOverlay) {
        modalOverlay.classList.remove('hidden');
        modalOverlay.style.display = 'flex';
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
        modalOverlay.style.display = 'none';
    }
    if (modalContent) modalContent.classList.remove('modal-landscape');

    if (window._onConfirmCancel) {
        const cancelFn = window._onConfirmCancel;
        window._onConfirmCancel = null;
        cancelFn();
    }
    window._onConfirmAction = null;

    if (appState.view === 'fighter-edit') {
        renderFighterEdit(document.getElementById('main-content'));
    }
}

function triggerConfirmAction() {
    const fn = window._onConfirmAction;
    window._onConfirmAction = null;
    window._onConfirmCancel = null;

    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
        modalOverlay.style.display = 'none';
    }
    if (modalContent) modalContent.classList.remove('modal-landscape');

    if (typeof fn === 'function') fn();
}

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : (type === 'success' ? 'toast-success' : '')}`;
    toast.innerHTML = `<span>${message}</span><span style="cursor:pointer; margin-left:10px; font-weight:bold; opacity:0.8;" onclick="this.parentElement.remove()">✕</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 3800);
}

window.alert = function(msg) {
    showToast(msg, 'info');
};

function showConfirmModal(title, message, confirmText, onConfirm, cancelText = "Annuler", onCancel = null) {
    window._onConfirmAction = onConfirm;
    window._onConfirmCancel = onCancel;

    const html = `
        <div style="padding: 10px 0;">
            <div style="font-size: 15px; margin-bottom: 22px; line-height: 1.5; color: #eee;">${message}</div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; flex-wrap:wrap;">
                <button class="btn" style="padding: 8px 16px; margin:0;" onclick="closeModal();">${cancelText}</button>
                <button class="btn btn-cyan" style="padding: 8px 20px; font-weight: bold; margin:0;" onclick="triggerConfirmAction();">${confirmText}</button>
            </div>
        </div>
    `;
    openModal(title, html);
}

function startNewCycleDirectly() {
    let recoveringFighters = (currentGang && currentGang.members) 
        ? currentGang.members.filter(m => m.recovery) 
        : [];
    let count = recoveringFighters.length;
    
    showConfirmModal(
        "Démarrer un Nouveau Cycle",
        `Voulez-vous passer au nouveau cycle de campagne ?<br><br>
        ${count > 0 
            ? `<div style="background:#141820; border:1px solid var(--accent-cyan); border-radius:6px; padding:10px; margin:8px 0; color:#eee;">
                <strong>${count} combattant(s)</strong> en convalescence (Recovery) seront rétablis :<br>
                <small style="color:var(--accent-cyan);">${recoveringFighters.map(f => escapeHtml(f.customName || f.charName)).join(', ')}</small>
               </div>`
            : '<span style="color:#10b981;">Tous les combattants sont déjà prêts au combat.</span>'}
        `,
        "Démarrer le Cycle",
        () => {
            if (currentGang && currentGang.members) {
                currentGang.members.forEach(m => {
                    m.recovery = false;
                    m.critInj = false;
                });
            }
            saveGangs();
            renderGangManage(document.getElementById('main-content'));
            showToast(`Nouveau cycle démarré ! ${count > 0 ? `${count} combattant(s) rétabli(s).` : ''}`, "success");
        }
    );
}

function clearFighterRecovery(idx) {
    if (!currentGang || !currentGang.members || !currentGang.members[idx]) return;
    let name = currentGang.members[idx].customName || currentGang.members[idx].charName || 'Combattant';
    currentGang.members[idx].recovery = false;
    currentGang.members[idx].critInj = false;
    saveGangs();
    renderGangManage(document.getElementById('main-content'));
    showToast(`${name} a terminé sa convalescence et est de nouveau disponible !`, "success");
}

function exportGang(name) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedGangs[name], null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `Gang_Delaque_${name.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
}

function importGang() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const gang = JSON.parse(event.target.result);
                gang.faction = 'Delaque';
                savedGangs[gang.name] = gang;
                saveGangs();
                showToast("Gang Delaque importé avec succès !", "success");
                navigate('gang-select');
            } catch(err) { alert("Fichier JSON invalide."); }
        };
        reader.readAsText(file);
    };
    input.click();
}

function deleteGang(name) {
    showConfirmModal(
        "Supprimer définitivement le gang",
        `Êtes-vous sûr de vouloir supprimer définitivement le gang <strong>${name}</strong> ?`,
        "Supprimer",
        () => {
            delete savedGangs[name];
            saveGangs();
            renderGangSelect(document.getElementById('main-content'));
            showToast(`Le gang ${name} a été supprimé.`, "info");
        }
    );
}

// ==========================================
// CARTES TACTIQUES
// ==========================================
function ensureNoDuplicateTactics(gang) {
    if (!gang || !gang.tactics) return;
    let seen = new Set();
    let clean = [];
    let allPool = (typeof db !== 'undefined' && db.tactics) ? db.tactics : [];
    gang.tactics.forEach(t => {
        let id = typeof t === 'string' ? t : (t && t.id ? t.id : null);
        if (id && !seen.has(id)) {
            seen.add(id);
            let full = allPool.find(x => x.id === id);
            if (full) clean.push(JSON.parse(JSON.stringify(full)));
            else if (typeof t === 'object') clean.push(t);
            else clean.push({ id, name: id, timing: '', effect: '' });
        }
    });
    gang.tactics = clean;
}

function getFighterTacticsCardCount(fighter) {
    if (!fighter) return 0;
    let types = (fighter.type || []).map(t => String(t || '').trim().toLowerCase());
    if (types.includes("leader")) return 2;
    if (types.includes("champion")) return 1;
    return 0;
}

function drawRandomTacticsForGang(gang, count) {
    if (!gang || count <= 0) return [];
    if (!gang.tactics) gang.tactics = [];
    ensureNoDuplicateTactics(gang);

    let ownedIds = gang.tactics.map(t => (typeof t === 'string' ? t : t.id));
    let allPool = (typeof db !== 'undefined' && db.tactics) ? db.tactics : [];
    let availablePool = allPool.filter(t => !ownedIds.includes(t.id));

    let drawn = [];
    for (let i = 0; i < count && availablePool.length > 0; i++) {
        let randIdx = Math.floor(Math.random() * availablePool.length);
        let picked = availablePool.splice(randIdx, 1)[0];
        let cardCopy = JSON.parse(JSON.stringify(picked));
        gang.tactics.push(cardCopy);
        drawn.push(cardCopy);
    }
    return drawn;
}

function handleRecruitTactics(fighter, isPostCycle) {
    if (!currentGang || !fighter) return;
    if (!currentGang.tactics) currentGang.tactics = [];
    ensureNoDuplicateTactics(currentGang);

    let count = getFighterTacticsCardCount(fighter);
    let drawnCards = [];
    if (count > 0) {
        drawnCards = drawRandomTacticsForGang(currentGang, count);
        saveGangs();
    }

    if (drawnCards.length > 0) {
        let html = `
            <div style="padding:4px;">
                <p>Combattant recruté : <strong>${fighter.customName || fighter.charName}</strong></p>
                <p style="color:var(--accent-cyan); font-weight:bold;">+${drawnCards.length} Carte(s) Tactique(s) débloquée(s) :</p>
                ${drawnCards.map(c => `
                    <div style="background:#141820; border:1px solid #242b38; padding:8px; border-radius:4px; margin:6px 0;">
                        <strong style="color:var(--accent-cyan);">${c.name}</strong><br>
                        <small style="color:var(--accent-purple);">${c.timing}</small><br>
                        <small style="color:#ddd;">${c.effect}</small>
                    </div>
                `).join('')}
                <button class="btn btn-cyan" style="width:100%; margin-top:10px;" onclick="closeModal()">Continuer</button>
            </div>
        `;
        openModal("Cartes Tactiques Débloquées", html);
    }
}

function openGangTacticsModal() {
    if (!currentGang) return;
    if (!currentGang.tactics) currentGang.tactics = [];
    ensureNoDuplicateTactics(currentGang);

    let allPool = (typeof db !== 'undefined' && db.tactics) ? db.tactics : [];
    let html = `<h4>Deck Tactique du Gang (${currentGang.tactics.length} / ${allPool.length})</h4><div style="max-height:55vh; overflow-y:auto;">`;

    if (currentGang.tactics.length === 0) {
        html += `<p style="color:#888;">Aucune carte tactique possédée.</p>`;
    } else {
        currentGang.tactics.forEach(t => {
            html += `
                <div style="border:1px solid #242b38; padding:8px 10px; margin-bottom:8px; border-radius:6px; background:#141820;">
                    <strong style="color:var(--accent-cyan);">${t.name}</strong><br>
                    <small style="color:var(--accent-purple);">${t.timing}</small><br>
                    <small style="color:#ddd;">${t.effect}</small>
                </div>
            `;
        });
    }
    html += `</div><br><button class="btn btn-cyan" style="width:100%;" onclick="closeModal()">Fermer</button>`;
    openModal("Cartes Tactiques", html);
}

function initApp() {
    const container = document.getElementById('main-content');
    if (container && (!container.innerHTML || container.innerHTML.trim() === '')) {
        navigate('menu');
    }
}

window.ensureNoDuplicateTactics = ensureNoDuplicateTactics;
window.getFighterTacticsCardCount = getFighterTacticsCardCount;
window.drawRandomTacticsForGang = drawRandomTacticsForGang;
window.handleRecruitTactics = handleRecruitTactics;
window.openGangTacticsModal = openGangTacticsModal;
window.openRecruitModal = openRecruitModal;
window.selectRecruitProfile = selectRecruitProfile;
window.toggleWyrdOption = toggleWyrdOption;
window.startNewCycleDirectly = startNewCycleDirectly;
window.clearFighterRecovery = clearFighterRecovery;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
