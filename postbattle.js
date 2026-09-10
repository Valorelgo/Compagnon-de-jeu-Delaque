// postbattle.js - Gestion du Post-Bataille & Post-Cycle Delaque (Soins, XP, Territoires, Réserve & Clôture)

let postCycleState = {
    step: 'medical', // 'medical', 'xp', 'territories', 'trading'
};

function renderPostCycleView(container) {
    if (!container) container = document.getElementById('main-content');
    if (!currentGang) return navigate('menu');

    appState.view = 'post-cycle';
    updateTopBar();

    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-bottom:1px solid #242b38; padding-bottom:12px; margin-bottom:16px;">
                <div>
                    <h2 style="margin:0;">Séquence de Post-Cycle — ${escapeHtml(currentGang.name)}</h2>
                    <span style="font-size:13px; color:#94a3b8;">Suivi de campagne après combat ou fin de cycle.</span>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-cyan" onclick="finishPostCycle()">✅ Valider le Post-Cycle & Nouveau Cycle</button>
                    <button class="btn-danger" onclick="navigate('gang-manage')">Quitter</button>
                </div>
            </div>

            <!-- Navigation des Étapes -->
            <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
                <button class="${postCycleState.step === 'medical' ? 'btn-cyan' : 'btn'}" onclick="setPostCycleStep('medical')">1. Soins & Récupération</button>
                <button class="${postCycleState.step === 'xp' ? 'btn-cyan' : 'btn'}" onclick="setPostCycleStep('xp')">2. XP & Avancements</button>
                <button class="${postCycleState.step === 'territories' ? 'btn-cyan' : 'btn'}" onclick="setPostCycleStep('territories')">3. Territoires & Revenus</button>
                <button class="${postCycleState.step === 'trading' ? 'btn-cyan' : 'btn'}" onclick="setPostCycleStep('trading')">4. Comptoir & Recrutement</button>
            </div>

            <div id="post-cycle-content">
                ${renderPostCycleStepContent()}
            </div>

            <div style="margin-top:20px; padding-top:14px; border-top:1px solid #242b38; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span style="font-size:13px; color:#94a3b8;">La validation clôture le cycle et rétablit tous les combattants en convalescence pour le cycle suivant.</span>
                <button class="btn btn-cyan" style="padding:10px 18px; font-weight:bold; font-size:14px;" onclick="finishPostCycle()">✅ Valider le Post-Cycle & Nouveau Cycle</button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function setPostCycleStep(step) {
    postCycleState.step = step;
    let content = document.getElementById('post-cycle-content');
    if (content) {
        content.innerHTML = renderPostCycleStepContent();
    }
}

function renderPostCycleStepContent() {
    switch(postCycleState.step) {
        case 'medical': return renderMedicalStep();
        case 'xp': return renderXPStep();
        case 'territories': return renderTerritoriesStep();
        case 'trading': return renderTradingStep();
        default: return '<p>Étape inconnue.</p>';
    }
}

// ==========================================
// 1. SOINS & RÉCUPÉRATION
// ==========================================
function renderMedicalStep() {
    let injuredFighters = currentGang.members.filter(m => m.recovery || m.critInj || (m.injuries && m.injuries.length > 0));
    let recoveryCount = currentGang.members.filter(m => m.recovery).length;

    let html = `
        <h3>1. Soins Médicaux et Convalescence</h3>
        <p style="color:#aaa; font-size:13px;">Gérez les blessures des combattants sortis hors de combat lors de la dernière bataille.</p>
        <div style="background:#0f172a; border:1px solid #1e293b; border-radius:6px; padding:10px 14px; margin:10px 0 14px 0; font-size:12px; color:#cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <span>ℹ️ <strong>Règle Necromunda :</strong> Valider le Post-Cycle (Nouveau Cycle) rétablit automatiquement tous les combattants en <em>Recovery</em>.</span>
            ${recoveryCount > 0 ? `<button class="btn btn-cyan" style="padding:4px 10px; font-size:12px; margin:0;" onclick="clearAllRecoveries()">Rétablir toutes les convalescences (${recoveryCount})</button>` : ''}
        </div>
    `;

    if (injuredFighters.length === 0) {
        html += `
            <div style="background:#141820; padding:15px; border-radius:6px; border:1px solid #242b38; margin:15px 0;">
                <p style="color:#10b981; margin:0;">✓ Aucun combattant n'est actuellement en convalescence ou blessé critique.</p>
            </div>
        `;
    } else {
        html += injuredFighters.map((m, idx) => {
            let realIdx = currentGang.members.findIndex(x => x.id === m.id);
            return `
                <div style="background:#141820; border:1px solid #242b38; border-radius:6px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color:#fff; font-size:15px;">${escapeHtml(m.customName || m.charName)}</strong> (${m.charName})<br>
                        ${m.recovery ? `<span style="background:#d97706; color:#fff; font-size:11px; padding:2px 6px; border-radius:3px; font-weight:bold;">En Convalescence (Recovery)</span> ` : ''}
                        ${m.critInj ? `<span style="background:#ef4444; color:#fff; font-size:11px; padding:2px 6px; border-radius:3px; font-weight:bold;">Blessure Critique</span> ` : ''}
                        ${(m.injuries && m.injuries.length > 0) ? `<small style="color:#ef4444;">[Séquelles : ${m.injuries.join(', ')}]</small>` : ''}
                    </div>
                    <div style="display:flex; gap:6px;">
                        ${m.recovery ? `<button class="btn btn-cyan" onclick="clearRecovery(${realIdx})">Fin de Convalescence</button>` : ''}
                        <button class="btn" onclick="rollLastingInjury(${realIdx})">🎲 Tirer Séquelle (D66)</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    return html;
}

function clearAllRecoveries() {
    if (!currentGang || !currentGang.members) return;
    let count = 0;
    currentGang.members.forEach(m => {
        if (m.recovery) {
            m.recovery = false;
            count++;
        }
        if (m.critInj) {
            m.critInj = false;
        }
    });
    saveGangs();
    renderPostCycleView();
    showToast(`${count} combattant(s) rétabli(s) de convalescence !`, "success");
}

function clearRecovery(idx) {
    if (!currentGang.members[idx]) return;
    currentGang.members[idx].recovery = false;
    currentGang.members[idx].critInj = false;
    saveGangs();
    renderPostCycleView();
    showToast("Le combattant a récupéré et est de nouveau prêt au combat !", "success");
}

function rollLastingInjury(idx) {
    let m = currentGang.members[idx];
    if (!m) return;
    let d1 = Math.floor(Math.random() * 6) + 1;
    let d2 = Math.floor(Math.random() * 6) + 1;
    let roll = d1 * 10 + d2;

    let title = "";
    let desc = "";
    let effect = () => {};

    if (roll >= 11 && roll <= 16) {
        title = "Leçon apprise";
        desc = "Le combattant gagne D3 XP sans séquelle permanente.";
        effect = () => { m.xp = (m.xp || 0) + Math.floor(Math.random() * 3) + 1; };
    } else if (roll >= 21 && roll <= 26) {
        title = "Hors de combat temporaire";
        desc = "Le combattant passe en convalescence (Recovery) pour le prochain affrontement.";
        effect = () => { m.recovery = true; };
    } else if (roll >= 31 && roll <= 36) {
        title = "Blessure à la jambe";
        desc = "La caractéristique Mouvement (M) est réduite de 1\".";
        effect = () => {
            if (!m.injuries) m.injuries = [];
            m.injuries.push("Mouvement -1\"");
            let curM = parseInt(m.stats.M) || 5;
            m.stats.M = `${Math.max(1, curM - 1)}"`;
        };
    } else if (roll >= 41 && roll <= 46) {
        title = "Blessure au bras";
        desc = "La caractéristique Capacité de Tir (BS) ou de Combat (WS) est diminuée.";
        effect = () => {
            if (!m.injuries) m.injuries = [];
            m.injuries.push("Bras blessé");
        };
    } else if (roll >= 51 && roll <= 56) {
        title = "Traumatisme crânien";
        desc = "Le combattant perd 1 point en Intelligence ou Sang-Froid.";
        effect = () => {
            if (!m.injuries) m.injuries = [];
            m.injuries.push("Traumatisme crânien");
        };
    } else {
        title = "Mort en service";
        desc = "Le combattant a succombé à ses blessures.";
        effect = () => {
            m.dead = true;
        };
    }

    effect();
    saveGangs();

    let html = `
        <div style="padding:10px;">
            <h3>Jet de Séquelle : D66 = ${roll}</h3>
            <h4 style="color:var(--accent-cyan); margin:8px 0;">${title}</h4>
            <p style="color:#ddd; font-size:14px;">${desc}</p>
            <button class="btn btn-cyan" onclick="closeModal(); renderPostCycleView();">Appliquer</button>
        </div>
    `;
    openModal("Table des Séquelles Durables", html);
}

// ==========================================
// 2. XP & AVANCEMENTS
// ==========================================
function renderXPStep() {
    let html = `
        <h3>2. Expérience & Avancements des Guerriers</h3>
        <p style="color:#aaa; font-size:13px;">Attribuez les points d'XP remportés et achetez des augmentations de caractéristiques ou de nouvelles compétences / pouvoirs psychoteric wyrd.</p>
    `;

    html += currentGang.members.map((m, idx) => {
        let xp = m.xp || 0;
        return `
            <div style="background:#141820; border:1px solid #242b38; border-radius:6px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <strong style="color:#fff; font-size:15px;">${escapeHtml(m.customName || m.charName)}</strong> (${m.charName})<br>
                    <span style="color:var(--accent-cyan); font-weight:bold;">XP Actuel : ${xp}</span> | 
                    <span style="color:#94a3b8;">Avancements : ${(m.advances || []).length}</span>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn" style="padding:4px 8px;" onclick="adjustXP(${idx}, 1)">+1 XP</button>
                    <button class="btn" style="padding:4px 8px;" onclick="adjustXP(${idx}, -1)">-1 XP</button>
                    <button class="btn btn-cyan" onclick="openAdvanceModal(${idx})">⭐ Acheter Avancement</button>
                </div>
            </div>
        `;
    }).join('');

    return html;
}

function adjustXP(idx, delta) {
    if (!currentGang.members[idx]) return;
    currentGang.members[idx].xp = Math.max(0, (currentGang.members[idx].xp || 0) + delta);
    saveGangs();
    renderPostCycleView();
}

function openAdvanceModal(idx) {
    let m = currentGang.members[idx];
    if (!m) return;
    let xp = m.xp || 0;

    let html = `
        <h3>Avancements pour ${escapeHtml(m.customName || m.charName)}</h3>
        <p>XP disponible : <strong style="color:var(--accent-cyan);">${xp} XP</strong></p>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
            <button class="btn" onclick="buyStatAdvance(${idx}, 'M', 1, 8)">+1\" Mouvement (8 XP)</button>
            <button class="btn" onclick="buyStatAdvance(${idx}, 'WS', 1, 9)">+1 Capacité de Combat (WS) (9 XP)</button>
            <button class="btn" onclick="buyStatAdvance(${idx}, 'BS', 1, 9)">+1 Capacité de Tir (BS) (9 XP)</button>
            <button class="btn" onclick="buyStatAdvance(${idx}, 'T', 1, 12)">+1 Endurance (T) (12 XP)</button>
            <button class="btn" onclick="buyStatAdvance(${idx}, 'W', 1, 10)">+1 Point de Vie (W) (10 XP)</button>
            <button class="btn btn-cyan" onclick="openLearnSkillModal(${idx})">🔮 Apprendre une Compétence / Pouvoir Wyrd (9 XP)</button>
        </div>
    `;
    openModal("Table d'Avancement", html);
}

function buyStatAdvance(idx, stat, amount, cost) {
    let m = currentGang.members[idx];
    if (!m) return;
    if ((m.xp || 0) < cost) {
        showToast(`XP insuffisant (${cost} XP requis).`, "error");
        return;
    }
    m.xp -= cost;
    if (!m.advances) m.advances = [];
    m.advances.push(`+${amount} ${stat}`);
    m.advancesCost = (m.advancesCost || 0) + 20; // +20 cr à la valeur du combattant

    let curVal = parseInt(m.stats[stat]) || 0;
    if (stat === 'M') {
        m.stats.M = `${curVal + amount}\"`;
    } else if (stat === 'WS' || stat === 'BS') {
        m.stats[stat] = `${Math.max(2, curVal - amount)}+`;
    } else {
        m.stats[stat] = curVal + amount;
    }

    saveGangs();
    closeModal();
    renderPostCycleView();
    showToast(`Avancement validé pour ${m.customName} !`, "success");
}

function openLearnSkillModal(idx) {
    let m = currentGang.members[idx];
    if (!m) return;
    closeModal();

    let isWyrd = m.isWyrd || (m.type || []).includes("wyrd");
    let html = `
        <h3>Choisir une Compétence ou Pouvoir (9 XP)</h3>
        <p>XP disponible : <strong style="color:var(--accent-cyan);">${m.xp || 0} XP</strong></p>
        <div style="max-height:55vh; overflow-y:auto;">
    `;

    for (let cat in db.skills) {
        if (cat === "generique") continue;
        html += `<h4 style="color:var(--accent-cyan); margin-top:10px;">${cat.toUpperCase()}</h4>`;
        db.skills[cat].forEach(s => {
            html += `
                <div class="fighter-item">
                    <div>
                        <strong>${s.name}</strong><br>
                        <small style="color:#aaa;">${s.desc}</small>
                    </div>
                    <button class="btn-cyan" onclick="confirmLearnSkill(${idx}, '${cat}', '${s.id}')">Apprendre</button>
                </div>
            `;
        });
    }

    html += `</div><br><button class="btn" onclick="closeModal()">Fermer</button>`;
    openModal("Apprentissage de Compétence", html);
}

function confirmLearnSkill(idx, cat, skillId) {
    let m = currentGang.members[idx];
    if (!m) return;
    if ((m.xp || 0) < 9) {
        showToast("XP insuffisant (9 XP requis).", "error");
        return;
    }
    const skillObj = db.skills[cat].find(s => s.id === skillId);
    if (!skillObj) return;

    m.xp -= 9;
    if (!m.skills) m.skills = [];
    m.skills.push(JSON.parse(JSON.stringify(skillObj)));
    if (!m.advances) m.advances = [];
    m.advances.push(`Compétence : ${skillObj.name}`);
    m.advancesCost = (m.advancesCost || 0) + 20;

    saveGangs();
    closeModal();
    renderPostCycleView();
    showToast(`${m.customName} a appris ${skillObj.name} !`, "success");
}

// ==========================================
// 3. TERRITOIRES & REVENUS
// ==========================================
function renderTerritoriesStep() {
    let territories = currentGang.territories || [];
    let html = `
        <h3>3. Territoires Détenus & Revenus Delaque</h3>
        <p style="color:#aaa; font-size:13px;">Exploitez les territoires sous le contrôle des ombres Delaque pour financer vos opérations.</p>
        <button class="btn btn-cyan" onclick="openClaimTerritoryModal()">+ Revendiquer un Territoire</button>
        <div style="margin-top:15px;">
    `;

    if (territories.length === 0) {
        html += `<p style="color:#888;">Aucun territoire contrôlé par le gang.</p>`;
    } else {
        html += territories.map((t, idx) => {
            return `
                <div style="background:#141820; border:1px solid #242b38; border-radius:6px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color:var(--accent-cyan); font-size:15px;">${t.name}</strong><br>
                        <small style="color:var(--accent-purple);">${t.income_rule || 'Revenu régulier'}</small><br>
                        <small style="color:#ddd;">${t.desc || ''}</small>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-cyan" onclick="collectTerritoryIncome(${idx})">💰 Collecter</button>
                        <button class="btn-danger" onclick="abandonTerritory(${idx})">Abandonner</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    html += `</div>`;
    return html;
}

function openClaimTerritoryModal() {
    let owned = (currentGang.territories || []).map(t => t.id);
    let available = (db.territories || []).filter(t => !owned.includes(t.id));

    let html = `<h3>Territoires Disponibles</h3><div style="max-height:55vh; overflow-y:auto;">`;
    available.forEach(t => {
        html += `
            <div class="fighter-item">
                <div>
                    <strong>${t.name}</strong><br>
                    <small style="color:var(--accent-purple);">${t.income_rule || ''}</small><br>
                    <small style="color:#aaa;">${t.desc || ''}</small>
                </div>
                <button class="btn-cyan" onclick="claimTerritory('${t.id}')">Revendiquer</button>
            </div>
        `;
    });
    html += `</div><br><button class="btn" onclick="closeModal()">Fermer</button>`;
    openModal("Revendication de Territoire", html);
}

function claimTerritory(tId) {
    const tObj = db.territories.find(t => t.id === tId);
    if (!tObj) return;
    if (!currentGang.territories) currentGang.territories = [];
    currentGang.territories.push(JSON.parse(JSON.stringify(tObj)));
    saveGangs();
    closeModal();
    renderPostCycleView();
    showToast(`Territoire ${tObj.name} revendiqué avec succès !`, "success");
}

function collectTerritoryIncome(idx) {
    let t = currentGang.territories[idx];
    if (!t) return;
    let d6 = Math.floor(Math.random() * 6) + 1;
    let revenue = d6 * 10;
    currentGang.credits = (currentGang.credits || 0) + revenue;
    saveGangs();
    updateTopBar();
    renderPostCycleView();
    showToast(`Territoire ${t.name} : D6 (${d6}) x 10 = +${revenue} crédits générés !`, "success");
}

function abandonTerritory(idx) {
    let t = currentGang.territories[idx];
    currentGang.territories.splice(idx, 1);
    saveGangs();
    renderPostCycleView();
    showToast(`Territoire ${t.name} abandonné.`, "info");
}

// ==========================================
// 4. COMPTOIR & RECRUTEMENT AU POST-CYCLE
// ==========================================
function renderTradingStep() {
    let html = `
        <h3>4. Comptoir d'Échange & Recrutement</h3>
        <p style="color:#aaa; font-size:13px;">Dépensez vos crédits pour acquérir de nouvelles armes sur la liste de Clan Delaque, ou recruter de nouveaux agents et mercenaires.</p>
        <div style="display:flex; gap:10px; margin-bottom:15px; flex-wrap:wrap;">
            <button class="btn btn-cyan" onclick="appState.returnTo = 'post-cycle'; openRecruitModal();">+ Recruter un Combattant / Mercenaire</button>
            <button class="btn" onclick="openStashModal()">📦 Gérer la Réserve (Stash)</button>
        </div>
        <h4>Équipement des Membres Existants :</h4>
    `;

    html += currentGang.members.map((m, idx) => {
        return `
            <div style="background:#141820; border:1px solid #242b38; border-radius:6px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#fff;">${escapeHtml(m.customName || m.charName)}</strong> (${m.charName})<br>
                    <small style="color:#aaa;">Armes : ${(m.weapons || []).map(w => w.name).join(', ') || 'Aucune'}</small>
                </div>
                <button class="btn-cyan" onclick="appState.returnTo = 'post-cycle'; editFighter(${idx})">Modifier Équipement</button>
            </div>
        `;
    }).join('');

    return html;
}

function finishPostCycle() {
    let recoveringFighters = (currentGang && currentGang.members) 
        ? currentGang.members.filter(m => m.recovery) 
        : [];
    let recCount = recoveringFighters.length;

    showConfirmModal(
        "Valider le Post-Cycle & Démarrer Nouveau Cycle",
        `Voulez-vous valider ce post-cycle et entamer le nouveau cycle de campagne ?<br><br>
        ${recCount > 0 
            ? `<div style="background:#141820; border:1px solid var(--accent-cyan); border-radius:6px; padding:10px; margin:8px 0; color:#eee;">
                <strong>${recCount} combattant(s)</strong> en convalescence (Recovery) seront automatiquement rétablis :<br>
                <small style="color:var(--accent-cyan);">${recoveringFighters.map(f => escapeHtml(f.customName || f.charName)).join(', ')}</small>
               </div>`
            : '<span style="color:#10b981;">Tous les combattants sont en état de combattre.</span>'}
        `,
        "Valider & Nouveau Cycle",
        () => {
            if (currentGang && currentGang.members) {
                currentGang.members.forEach(m => {
                    m.recovery = false;
                    m.critInj = false;
                });
            }
            saveGangs();
            navigate('gang-manage');
            if (recCount > 0) {
                showToast(`Nouveau cycle validé ! ${recCount} combattant(s) rétabli(s) de convalescence.`, "success");
            } else {
                showToast("Post-cycle validé et nouveau cycle entamé avec succès !", "success");
            }
        }
    );
}

// ==========================================
// STASH, TERRITOIRES & HISTORIQUE MODALS
// ==========================================
function openStashModal() {
    if (!currentGang) return;
    if (!currentGang.stash) currentGang.stash = [];

    let html = `
        <h3>Réserve du Gang (Stash)</h3>
        <p style="color:#aaa; font-size:13px;">Contient les armes et équipements non assignés disponibles pour vos guerriers.</p>
        <div style="max-height:50vh; overflow-y:auto; margin:10px 0;">
    `;

    if (currentGang.stash.length === 0) {
        html += `<p style="color:#888;">La réserve est vide.</p>`;
    } else {
        currentGang.stash.forEach((item, idx) => {
            let name = typeof item === 'string' ? item : item.name;
            let cost = (typeof item === 'object') ? (item.cost || item.cost_credits || 0) : 0;
            let type = (typeof item === 'object') ? (item.type || 'Équipement') : 'Équipement';

            html += `
                <div class="fighter-item">
                    <div>
                        <strong>${name}</strong> (${cost}c) - <small style="color:var(--accent-purple);">${type}</small>
                    </div>
                    <button class="btn-danger" onclick="sellStashItem(${idx})">Vendre (50%)</button>
                </div>
            `;
        });
    }

    html += `</div><br><button class="btn" onclick="closeModal()">Fermer</button>`;
    openModal("Réserve du Gang", html);
}

function sellStashItem(idx) {
    let item = currentGang.stash[idx];
    if (!item) return;
    let cost = (typeof item === 'object') ? (item.cost || item.cost_credits || 0) : 0;
    let refund = Math.floor(cost / 2);
    currentGang.credits = (currentGang.credits || 0) + refund;
    currentGang.stash.splice(idx, 1);
    saveGangs();
    updateTopBar();
    openStashModal();
    showToast(`Objet vendu pour +${refund} crédits.`);
}

function openTerritoriesModal() {
    if (!currentGang) return;
    let territories = currentGang.territories || [];
    let html = `<h3>Territoires Contrôlés</h3><div style="max-height:50vh; overflow-y:auto; margin:10px 0;">`;
    if (territories.length === 0) {
        html += `<p style="color:#888;">Aucun territoire contrôlé.</p>`;
    } else {
        territories.forEach(t => {
            html += `
                <div style="border:1px solid #242b38; padding:8px 10px; margin-bottom:8px; border-radius:6px; background:#141820;">
                    <strong style="color:var(--accent-cyan);">${t.name}</strong><br>
                    <small style="color:var(--accent-purple);">${t.income_rule || ''}</small><br>
                    <small style="color:#ddd;">${t.desc || ''}</small>
                </div>
            `;
        });
    }
    html += `</div><br><button class="btn" onclick="closeModal()">Fermer</button>`;
    openModal("Territoires", html);
}

function openMatchHistoryModal() {
    let html = `
        <h3>Historique des Matchs Delaque</h3>
        <p style="color:#aaa; font-size:13px;">Journal des affrontements menés sous l'égide de la Maison des Ombres.</p>
        <div style="background:#141820; padding:15px; border-radius:6px; border:1px solid #242b38; margin:15px 0;">
            <p style="color:#888; margin:0;">Aucun match archivé pour le moment dans ce cycle.</p>
        </div>
        <button class="btn" onclick="closeModal()">Fermer</button>
    `;
    openModal("Historique des Matchs", html);
}

window.renderPostCycleView = renderPostCycleView;
window.setPostCycleStep = setPostCycleStep;
window.clearRecovery = clearRecovery;
window.clearAllRecoveries = clearAllRecoveries;
window.rollLastingInjury = rollLastingInjury;
window.adjustXP = adjustXP;
window.openAdvanceModal = openAdvanceModal;
window.buyStatAdvance = buyStatAdvance;
window.openLearnSkillModal = openLearnSkillModal;
window.confirmLearnSkill = confirmLearnSkill;
window.openClaimTerritoryModal = openClaimTerritoryModal;
window.claimTerritory = claimTerritory;
window.collectTerritoryIncome = collectTerritoryIncome;
window.abandonTerritory = abandonTerritory;
window.finishPostCycle = finishPostCycle;
window.openStashModal = openStashModal;
window.sellStashItem = sellStashItem;
window.openTerritoriesModal = openTerritoriesModal;
window.openMatchHistoryModal = openMatchHistoryModal;
