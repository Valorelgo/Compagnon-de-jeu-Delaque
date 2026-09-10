// game.js - Gestion des Parties (Campagne & Rapide), Suivi du Combat, Règle Psychoteric Choir et Déroulement du Match

let gameState = {
    isQuickMatch: false,
    crew: [],
    round: 1,
    priority: 'player', // 'player' or 'enemy'
    bottleTested: false,
    bottledOut: false,
    fightersOOAThisRound: [], // Combattants mis hors de combat durant ce round
    bottleCheckedThisRound: false, // Assure qu'un seul bottlecheck est réalisé par round
    tacticsHand: [],
    log: [],
    lastBattleRecap: [] // Bilan XP et blessures de la dernière bataille
};

window.gameState = gameState;
window._selectedFleeingFighterIds = [];

function resetSetupState() {
    gameState = {
        isQuickMatch: appState.isQuickMatch || false,
        crew: [],
        round: 1,
        priority: 'player',
        bottleTested: false,
        bottledOut: false,
        fightersOOAThisRound: [],
        bottleCheckedThisRound: false,
        tacticsHand: [],
        log: [],
        lastBattleRecap: []
    };
    window.gameState = gameState;
    window._selectedFleeingFighterIds = [];
}

function renderGameSetup(container) {
    if (!currentGang || !currentGang.members || currentGang.members.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h2>Aucun combattant disponible</h2>
                <p>Vous devez recruter au moins un combattant Delaque pour lancer une partie.</p>
                <button onclick="navigate('gang-manage')">Retour au Gang</button>
            </div>
        `;
        return;
    }

    let isQuick = appState.isQuickMatch;
    let availableMembers = currentGang.members.filter(m => !m.recovery && !m.dead && !m.captured);

    let html = `
        <div class="card">
            <h2>${isQuick ? '⚡ Partie Rapide' : '⚔️ Préparation de la Bataille'} — Sélection de l\'Équipage</h2>
            <p style="color:#aaa; font-size:13px;">Sélectionnez les combattants Delaque qui participent à cet affrontement.</p>
            
            <div style="margin: 12px 0;">
                <button class="btn btn-cyan" onclick="selectAllCrew(true)">Tout sélectionner</button>
                <button class="btn" onclick="selectAllCrew(false)">Tout désélectionner</button>
            </div>

            <div style="max-height:50vh; overflow-y:auto; margin-bottom:15px;">
                ${availableMembers.map((m, idx) => {
                    let checked = gameState.crew.some(c => c.id === m.id) ? 'checked' : '';
                    return `
                        <div class="fighter-item" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin-bottom:6px; background:#141820; border-radius:4px; border:1px solid #242b38;">
                            <label style="cursor:pointer; display:flex; align-items:center; gap:10px; width:100%;">
                                <input type="checkbox" id="crew-check-${idx}" ${checked} onchange="toggleCrewMember('${m.id}')" style="transform:scale(1.2);">
                                <div>
                                    <strong style="color:#fff;">${escapeHtml(m.customName || m.charName)}</strong> 
                                    <span style="color:#94a3b8; font-size:12px;">(${m.charName})</span>
                                    ${m.isWyrd ? `<span style="background:rgba(194,94,26,0.25); color:#fdba74; border:1px solid var(--accent-secondary); padding:1px 5px; border-radius:3px; font-size:10px; margin-left:6px;">🔮 Wyrd</span>` : ''}
                                    <br><small style="color:var(--accent-cyan); font-size:11px;">Coût : ${m.totalCost} cr | Armes : ${(m.weapons || []).map(w => w.name).join(', ') || 'Aucune'}</small>
                                </div>
                            </label>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-cyan" onclick="startBattle()">Commencer la Bataille</button>
                <button class="btn-danger" onclick="navigate('gang-manage')">Annuler</button>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function selectAllCrew(select) {
    let availableMembers = currentGang.members.filter(m => !m.recovery && !m.dead && !m.captured);
    if (select) {
        gameState.crew = availableMembers.map(m => createCombatFighterInstance(m));
    } else {
        gameState.crew = [];
    }
    renderGameSetup(document.getElementById('main-content'));
}

function toggleCrewMember(fighterId) {
    let existingIdx = gameState.crew.findIndex(c => c.id === fighterId);
    if (existingIdx >= 0) {
        gameState.crew.splice(existingIdx, 1);
    } else {
        let m = currentGang.members.find(x => x.id === fighterId);
        if (m) {
            gameState.crew.push(createCombatFighterInstance(m));
        }
    }
    renderGameSetup(document.getElementById('main-content'));
}

function createCombatFighterInstance(m) {
    return {
        id: m.id,
        charId: m.charId,
        charName: m.charName,
        customName: m.customName,
        type: [...(m.type || [])],
        stats: JSON.parse(JSON.stringify(m.stats || {})),
        weapons: JSON.parse(JSON.stringify(m.weapons || [])),
        equipment: JSON.parse(JSON.stringify(m.equipment || [])),
        skills: JSON.parse(JSON.stringify(m.skills || [])),
        isWyrd: m.isWyrd || false,
        totalCost: m.totalCost || 0,
        currentWounds: parseInt(m.stats ? m.stats.W : 1) || 1,
        maxWounds: parseInt(m.stats ? m.stats.W : 1) || 1,
        fleshWounds: 0,
        state: 'ready', // 'ready', 'pinned', 'seriously_injured', 'out_of_action', 'fled'
        wasSeriouslyInjuredBeforeFleeing: false,
        isEngaged: false,
        isActivated: false,
        choirActive: false, // Delaque Psychoteric Choir buff
        matchXP: 0, // Accomplissements durant le match (blessures, assists, etc.)
        xpFeats: []
    };
}

function startBattle() {
    if (gameState.crew.length === 0) {
        showToast("Veuillez sélectionner au moins un combattant pour la bataille.", "error");
        return;
    }

    // Tirer 3 cartes tactiques depuis le gang
    let gangTactics = currentGang.tactics || [];
    gameState.tacticsHand = [];
    if (gangTactics.length > 0) {
        let pool = [...gangTactics];
        for (let i = 0; i < 3 && pool.length > 0; i++) {
            let r = Math.floor(Math.random() * pool.length);
            gameState.tacticsHand.push(pool.splice(r, 1)[0]);
        }
    }

    gameState.round = 1;
    gameState.fightersOOAThisRound = [];
    gameState.bottleCheckedThisRound = false;

    renderCombatView(document.getElementById('main-content'));
}

function renderCombatView(container) {
    let standingCount = gameState.crew.filter(c => c.state !== 'out_of_action' && c.state !== 'fled').length;
    let ooaCount = gameState.crew.filter(c => c.state === 'out_of_action').length;
    let fledCount = gameState.crew.filter(c => c.state === 'fled').length;
    let totalCount = gameState.crew.length;
    let hasOOAThisRound = (gameState.fightersOOAThisRound || []).length > 0 && !gameState.bottleCheckedThisRound;

    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-bottom:1px solid #242b38; padding-bottom:10px; margin-bottom:12px;">
                <div>
                    <h2 style="margin:0;">Tableau de Combat — Round ${gameState.round}</h2>
                    <span style="font-size:13px; color:#94a3b8;">
                        Priorité : <strong style="color:${gameState.priority === 'player' ? 'var(--accent-cyan)' : 'var(--accent-secondary)'};">${gameState.priority === 'player' ? 'Delaque (Vous)' : 'Ennemi'}</strong> | 
                        Combattants actifs : <strong style="color:#10b981;">${standingCount}/${totalCount}</strong> | 
                        Hors de combat : <strong style="color:#ef4444;">${ooaCount}</strong>
                        ${fledCount > 0 ? ` | Fuyards : <strong style="color:#94a3b8;">${fledCount}</strong>` : ''}
                    </span>
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <button class="btn btn-cyan" style="margin:0;" onclick="togglePriority()">Changer Priorité</button>
                    ${hasOOAThisRound ? `
                        <button class="btn-danger" style="background:#dc2626; color:#fff; border:1px solid #ef4444; font-weight:bold; box-shadow:0 0 12px rgba(220,38,38,0.6); padding:8px 16px; margin:0;" onclick="handleEndOfRoundClick()">
                            🚨 Fin de Round & Bottlecheck (${gameState.fightersOOAThisRound.length} OOA) ⏩
                        </button>
                    ` : `
                        <button class="btn" style="margin:0;" onclick="handleEndOfRoundClick()">Round Suivant ⏩</button>
                    `}
                    <button class="btn-danger" style="margin:0;" onclick="confirmEndBattle()">Terminer la Bataille</button>
                </div>
            </div>

            ${hasOOAThisRound ? `
                <div style="background:#261313; border:1px solid #ef4444; border-radius:6px; padding:10px 14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="color:#ef4444; font-size:14px;">⚠️ ${gameState.fightersOOAThisRound.length} combattant(s) mis Hors de Combat ce round !</strong><br>
                        <span style="font-size:12px; color:#fca5a5;">Le bouton Fin de Round est rouge. Un Bottlecheck unique doit être réalisé avant de passer au round suivant.</span>
                    </div>
                    <button class="btn-danger" style="margin:0; padding:6px 14px; font-size:12px;" onclick="openBottleCheckModal()">Ouvrir le Bottlecheck</button>
                </div>
            ` : ''}

            <div style="background:#0f131a; border:1px solid var(--accent-secondary); border-radius:6px; padding:10px 14px; margin-bottom:15px; font-size:13px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>
                    <strong style="color:var(--accent-cyan);">🔮 Règle Delaque — Psychoteric choir :</strong><br>
                    <span style="color:#cbd5e1;">Quand un guerrier Delaque est à 3" ou moins de 2+ alliés, il gagne +1 Ld et +1 Will. Activez le buff individuellement ci-dessous si le positionnement est respecté !</span>
                </div>
                <button class="btn-cyan" style="font-size:11px; padding:4px 10px; margin:0;" onclick="openCombatTacticsModal()">🎴 Cartes en main (${gameState.tacticsHand.length})</button>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:12px;">
                ${gameState.crew.map((fighter, fIdx) => renderFighterCombatCard(fighter, fIdx)).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderFighterCombatCard(fighter, fIdx) {
    let isOOA = fighter.state === 'out_of_action';
    let isFled = fighter.state === 'fled';
    let isSeriouslyInjured = fighter.state === 'seriously_injured';
    let isPinned = fighter.state === 'pinned';

    let ldStat = parseInt(fighter.stats.Ld) || 7;
    let willStat = parseInt(fighter.stats.Wil) || 7;
    if (fighter.choirActive) {
        ldStat = Math.max(2, ldStat - 1);
        willStat = Math.max(2, willStat - 1);
    }

    let cardBorder = isOOA ? '#ef4444' : (isFled ? '#64748b' : (fighter.isActivated ? '#334155' : 'var(--accent-cyan)'));
    let cardBg = isOOA ? '#170f12' : (isFled ? '#0f131a' : '#10141c');
    let cardOpacity = isOOA ? '0.6' : (isFled ? '0.45' : '1');
    let borderStyle = isFled ? 'dashed' : 'solid';

    return `
        <div style="background:${cardBg}; border:1px ${borderStyle} ${cardBorder}; border-radius:6px; padding:12px; opacity:${cardOpacity}; transition:0.2s;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div>
                    <strong style="font-size:15px; color:#fff;">${escapeHtml(fighter.customName || fighter.charName)}</strong>
                    <br><span style="font-size:11px; color:#94a3b8;">${fighter.charName} ${fighter.isWyrd ? '• 🔮 Wyrd' : ''}</span>
                </div>
                <div>
                    ${isOOA ? `
                        <span style="font-size:11px; padding:2px 8px; border-radius:10px; font-weight:bold; background:#ef4444; color:#fff;">💀 Hors de Combat</span>
                    ` : (isFled ? `
                        <span style="font-size:11px; padding:2px 8px; border-radius:10px; font-weight:bold; background:#475569; color:#cbd5e1;">🏃 Fuyard</span>
                    ` : `
                        <span style="font-size:11px; padding:2px 8px; border-radius:10px; font-weight:bold; background:${fighter.isActivated ? '#334155' : '#10b981'}; color:#fff;">
                            ${fighter.isActivated ? 'Activé' : 'Prêt'}
                        </span>
                    `)}
                </div>
            </div>

            ${isFled ? `
                <div style="background:#090c10; border-left:3px solid #64748b; padding:6px 10px; border-radius:4px; font-size:11px; margin-bottom:8px; line-height:1.4;">
                    <strong>🏃 Fuyard (Retiré de la table)</strong><br>
                    ${fighter.wasSeriouslyInjuredBeforeFleeing 
                        ? '<span style="color:#ef4444;">⚠️ A fui sérieusement blessé : subira un jet de séquelle en post-bataille.</span>' 
                        : '<span style="color:#10b981;">🛡️ Protégé : indemne, ne subit pas les conséquences d\'une mise hors de combat.</span>'}
                </div>
            ` : ''}

            ${isOOA ? `
                <div style="background:#090c10; border-left:3px solid #ef4444; padding:6px 10px; border-radius:4px; font-size:11px; margin-bottom:8px; line-height:1.4;">
                    <strong style="color:#ef4444;">💀 Hors de combat</strong> — Convalescence & jet de séquelle à résoudre en post-bataille.
                </div>
            ` : ''}

            <!-- Stats Bar -->
            <div style="display:flex; gap:4px; text-align:center; font-size:10px; margin-bottom:8px; background:#0a0c10; padding:4px; border-radius:4px;">
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">M</strong><br>${fighter.stats.M || '-'}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">WS</strong><br>${fighter.stats.WS || '-'}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">BS</strong><br>${fighter.stats.BS || '-'}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">S</strong><br>${fighter.stats.S || '-'}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">T</strong><br>${fighter.stats.T || '-'}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">W</strong><br>${fighter.currentWounds}/${fighter.maxWounds}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">I</strong><br>${fighter.stats.I || '-'}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">A</strong><br>${fighter.stats.A || '-'}</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">Ld</strong><br>${ldStat}+</div>
                <div style="flex:1;"><strong style="color:var(--accent-cyan);">Wil</strong><br>${willStat}+</div>
            </div>

            <!-- Choir Toggle -->
            ${!isFled && !isOOA ? `
                <div style="margin-bottom:8px; font-size:12px; display:flex; align-items:center; justify-content:space-between; background:#161c28; padding:4px 8px; border-radius:4px;">
                    <label style="cursor:pointer; display:flex; align-items:center; gap:6px; color:#fdba74;">
                        <input type="checkbox" ${fighter.choirActive ? 'checked' : ''} onchange="toggleChoirBuff(${fIdx}, this.checked)">
                        Choir (+1 Ld/Wil)
                    </label>
                    <span style="font-size:11px; color:#888;">${fighter.fleshWounds} chair blessée</span>
                </div>
            ` : ''}

            <!-- State controls -->
            ${isFled ? `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="color:#94a3b8; font-size:12px; font-style:italic;">Retiré de la table</span>
                    <button class="btn" style="padding:2px 8px; font-size:11px; margin:0;" onclick="cancelFighterFled(${fIdx})">Annuler fuite</button>
                </div>
            ` : `
                <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
                    <button class="btn" style="padding:3px 6px; font-size:11px; margin:0; ${isPinned ? 'background:#d97706; color:#fff;' : ''}" onclick="setFighterState(${fIdx}, '${isPinned ? 'ready' : 'pinned'}')">📌 Pinned</button>
                    <button class="btn" style="padding:3px 6px; font-size:11px; margin:0; ${isSeriouslyInjured ? 'background:#b91c1c; color:#fff;' : ''}" onclick="setFighterState(${fIdx}, '${isSeriouslyInjured ? 'ready' : 'seriously_injured'}')">🩸 Blessé Grave</button>
                    <button class="btn-danger" style="padding:3px 6px; font-size:11px; margin:0; ${isOOA ? 'background:#7f1d1d; color:#fff;' : ''}" onclick="setFighterState(${fIdx}, '${isOOA ? 'ready' : 'out_of_action'}')">💀 Hors de Combat</button>
                    <button class="btn" style="padding:3px 6px; font-size:11px; margin:0; ${fighter.isActivated ? 'background:#475569; color:#fff;' : 'background:#10b981; color:#fff;'}" ${isOOA ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''} onclick="toggleFighterActivation(${fIdx})">${fighter.isActivated ? 'Désactiver' : 'Activer'}</button>
                </div>
            `}

            <!-- Suivi XP du match (Conservation garantie même OOA ou Fuyard) -->
            <div style="background:#080b10; border:1px solid #1e2532; border-radius:4px; padding:6px 8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                <div>
                    <strong style="color:var(--accent-cyan); font-size:12px;">⭐ XP du match : +${(fighter.matchXP || 0) + 1} XP</strong>
                    <span style="color:#64748b; font-size:10px;">(1 part. + ${fighter.matchXP || 0} expl.)</span>
                </div>
                <div style="display:flex; gap:3px;">
                    <button class="btn" style="padding:2px 6px; font-size:10px; margin:0;" title="Adversaire blessé ou mis hors de combat (+1 XP)" onclick="addFighterMatchXP(${fIdx}, 1, 'Blessure/OOA')">+1 XP OOA</button>
                    <button class="btn" style="padding:2px 6px; font-size:10px; margin:0;" title="Assistance / ralliement / action tactique (+1 XP)" onclick="addFighterMatchXP(${fIdx}, 1, 'Assistance')">+1 XP Assist</button>
                    ${(fighter.matchXP || 0) > 0 ? `<button class="btn-danger" style="padding:2px 5px; font-size:10px; margin:0;" title="Retirer 1 XP" onclick="addFighterMatchXP(${fIdx}, -1, 'Annulation')">-1</button>` : ''}
                </div>
            </div>

            <!-- Armes et Pouvoirs -->
            <div style="font-size:12px; color:#cbd5e1; border-top:1px solid #1e2532; padding-top:6px;">
                <div><strong style="color:var(--accent-cyan);">Armes :</strong> ${(fighter.weapons || []).map(w => w.name).join(', ') || 'Aucune'}</div>
                ${fighter.isWyrd ? `
                    <div style="margin-top:4px;">
                        <strong style="color:var(--accent-secondary);">Pouvoirs :</strong> 
                        ${(fighter.skills || []).filter(s => {
                            let n = typeof s === 'string' ? s : s.name;
                            return (db.skills["psychoteric wyrd"] || []).some(w => w.name.toLowerCase() === n.toLowerCase());
                        }).map(s => typeof s === 'string' ? s : s.name).join(', ') || 'Aucun'}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function addFighterMatchXP(fIdx, delta, reason) {
    if (!gameState.crew[fIdx]) return;
    let f = gameState.crew[fIdx];
    f.matchXP = Math.max(0, (f.matchXP || 0) + delta);
    if (!f.xpFeats) f.xpFeats = [];
    if (delta > 0) {
        f.xpFeats.push(reason || 'Exploit');
        showToast(`+${delta} XP attribué à ${f.customName || f.charName} (${reason || 'Exploit'}) !`, "success");
    } else {
        if (f.xpFeats.length > 0) f.xpFeats.pop();
        showToast(`XP ajusté pour ${f.customName || f.charName}`, "info");
    }
    renderCombatView(document.getElementById('main-content'));
}

function cancelFighterFled(fIdx) {
    if (!gameState.crew[fIdx]) return;
    let f = gameState.crew[fIdx];
    f.state = f.wasSeriouslyInjuredBeforeFleeing ? 'seriously_injured' : 'ready';
    f.wasSeriouslyInjuredBeforeFleeing = false;
    f.isActivated = false;
    showToast(`Fuite annulée pour ${f.customName || f.charName}.`, "info");
    renderCombatView(document.getElementById('main-content'));
}

function togglePriority() {
    gameState.priority = gameState.priority === 'player' ? 'enemy' : 'player';
    renderCombatView(document.getElementById('main-content'));
}

function handleEndOfRoundClick() {
    let hasOOAThisRound = (gameState.fightersOOAThisRound || []).length > 0 && !gameState.bottleCheckedThisRound;
    if (hasOOAThisRound) {
        openBottleCheckModal();
    } else {
        nextRound();
    }
}

function nextRound() {
    gameState.round += 1;
    gameState.fightersOOAThisRound = [];
    gameState.bottleCheckedThisRound = false;
    gameState.crew.forEach(f => {
        if (f.state !== 'out_of_action' && f.state !== 'fled') {
            f.isActivated = false;
        }
    });
    showToast(`Début du Round ${gameState.round} !`);
    renderCombatView(document.getElementById('main-content'));
}

function toggleFighterActivation(fIdx) {
    if (!gameState.crew[fIdx]) return;
    gameState.crew[fIdx].isActivated = !gameState.crew[fIdx].isActivated;
    renderCombatView(document.getElementById('main-content'));
}

function setFighterState(fIdx, newState) {
    if (!gameState.crew[fIdx]) return;
    let fighter = gameState.crew[fIdx];
    let prevState = fighter.state;
    if (prevState === newState) return;

    if (newState === 'out_of_action') {
        fighter.state = 'out_of_action';
        fighter.isActivated = true;

        if (!gameState.fightersOOAThisRound) gameState.fightersOOAThisRound = [];
        if (!gameState.fightersOOAThisRound.includes(fighter.id)) {
            gameState.fightersOOAThisRound.push(fighter.id);
        }
        gameState.bottleCheckedThisRound = false;

        renderCombatView(document.getElementById('main-content'));
        showOOAReminderModal(fighter);
    } else {
        fighter.state = newState;
        if (prevState === 'out_of_action') {
            if (gameState.fightersOOAThisRound) {
                gameState.fightersOOAThisRound = gameState.fightersOOAThisRound.filter(id => id !== fighter.id);
            }
        }
        renderCombatView(document.getElementById('main-content'));
    }
}

function showOOAReminderModal(fighter) {
    let name = escapeHtml(fighter.customName || fighter.charName);
    let html = `
        <div style="padding:4px 0;">
            <div style="background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:6px; padding:12px; margin-bottom:14px; text-align:center;">
                <strong style="color:#ef4444; font-size:16px;">💀 ${name} passe Hors de Combat !</strong>
            </div>

            <div style="background:#141820; border:1px solid #f59e0b; border-radius:6px; padding:12px 14px; margin-bottom:14px;">
                <h4 style="color:#f59e0b; margin:0 0 6px 0; display:flex; align-items:center; gap:6px; font-size:14px;">
                    <span>⚠️</span> Test de Sang-Froid (Cool) — 3"
                </h4>
                <p style="font-size:13px; color:#e2e8f0; margin:0; line-height:1.5;">
                    <strong>Rappel de règle Necromunda :</strong><br>
                    N'oubliez pas d'effectuer immédiatement un <strong>Test de Sang-Froid (Cool)</strong> pour tous les alliés situés dans un rayon de <strong>3 pouces (3")</strong> de ce combattant pour éviter qu'ils ne soient Démoralisés (Broken).
                </p>
            </div>

            <div style="background:#141820; border:1px solid #ef4444; border-radius:6px; padding:12px 14px; margin-bottom:16px;">
                <h4 style="color:#ef4444; margin:0 0 6px 0; display:flex; align-items:center; gap:6px; font-size:14px;">
                    <span>🚨</span> Test de Déroute (Bottlecheck) à la Fin du Round
                </h4>
                <p style="font-size:13px; color:#cbd5e1; margin:0; line-height:1.5;">
                    Cette perte impose un <strong>Test de Déroute (Bottlecheck)</strong> à la fin de ce Round. Le bouton <strong>Fin de Round</strong> est maintenant <strong style="color:#ef4444;">ROUGE</strong>.
                </p>
            </div>

            <div style="display:flex; justify-content:flex-end;">
                <button class="btn btn-cyan" style="padding:8px 18px; font-weight:bold; margin:0;" onclick="closeModal()">Compris (Poursuivre le round)</button>
            </div>
        </div>
    `;
    openModal("💀 Combattant Hors de Combat", html);
}

function openBottleCheckModal() {
    let totalCrew = gameState.crew.length;
    let ooaCount = gameState.crew.filter(c => c.state === 'out_of_action').length;
    let fledCount = gameState.crew.filter(c => c.state === 'fled').length;
    let totalLosses = ooaCount + fledCount;
    let roundOOACount = (gameState.fightersOOAThisRound || []).length;

    let initialRoll = Math.floor(Math.random() * 6) + 1;
    let initialTotal = initialRoll + totalLosses;
    let isAutoFailed = initialTotal > totalCrew;

    let html = `
        <div style="padding:4px 0;">
            <div style="background:#1e1b2e; border:1px solid var(--accent-secondary); border-radius:6px; padding:12px; margin-bottom:14px;">
                <h4 style="color:var(--accent-cyan); margin:0 0 6px 0; font-size:16px;">
                    Test de Déroute (Bottlecheck) — Fin du Round ${gameState.round}
                </h4>
                <p style="font-size:13px; color:#cbd5e1; margin:0; line-height:1.5;">
                    ${roundOOACount} combattant(s) ont été mis hors de combat durant ce round. Ce test est unique pour l'ensemble du round.
                </p>
            </div>

            <div style="background:#141820; border:1px solid #242b38; border-radius:6px; padding:12px; margin-bottom:14px; font-size:13px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Effectif initial du gang :</span>
                    <strong style="color:#fff;">${totalCrew} combattants</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Combattants Hors de Combat :</span>
                    <strong style="color:#ef4444;">${ooaCount}</strong>
                </div>
                ${fledCount > 0 ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Combattants ayant fui :</span>
                    <strong style="color:#94a3b8;">${fledCount}</strong>
                </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; border-top:1px solid #1e2532; padding-top:6px; margin-top:6px;">
                    <span>Total des pertes (OOA + Fuyards) :</span>
                    <strong style="color:var(--accent-cyan);">${totalLosses}</strong>
                </div>
            </div>

            <!-- Dice Roll Box -->
            <div id="bottle-roll-box" style="background:#0c0e12; border:1px solid #334155; border-radius:6px; padding:14px; text-align:center; margin-bottom:16px;">
                <div style="font-size:13px; color:#94a3b8; margin-bottom:6px;">Règle : <strong>1D6 + Pertes cumulées (${totalLosses})</strong> vs Effectif (${totalCrew})</div>
                <div style="font-size:20px; font-weight:bold; color:#fff; margin-bottom:8px;">
                    Dé = <span id="bottle-dice-val" style="color:var(--accent-cyan); font-size:24px;">${initialRoll}</span> 
                    + ${totalLosses} = 
                    <span id="bottle-total-val" style="color:${isAutoFailed ? '#ef4444' : '#10b981'}; font-size:24px;">${initialTotal}</span>
                </div>
                <div id="bottle-verdict" style="font-size:13px; font-weight:bold; color:${isAutoFailed ? '#ef4444' : '#10b981'}; margin-bottom:10px;">
                    ${isAutoFailed ? `❌ Échec théorique (${initialTotal} > ${totalCrew}) — Le gang déroute !` : `✓ Réussite théorique (${initialTotal} ≤ ${totalCrew}) — Le gang tient bon !`}
                </div>
                <button class="btn" style="padding:4px 12px; font-size:12px; margin:0;" onclick="reRollBottleDice(${totalLosses}, ${totalCrew})">🎲 Relancer le D6</button>
            </div>

            <!-- Action buttons -->
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button class="btn btn-cyan" style="padding:10px; font-weight:bold; font-size:14px; margin:0;" onclick="resolveBottleCheck(true)">
                    ✅ Test Réussi (Le gang tient bon & début Round ${gameState.round + 1})
                </button>
                <button class="btn-danger" style="padding:10px; font-weight:bold; font-size:14px; margin:0;" onclick="resolveBottleCheck(false)">
                    ❌ Test Raté (Déroute — Désigner 1 ou 2 fuyards)
                </button>
            </div>
        </div>
    `;

    openModal(`Test de Déroute — Round ${gameState.round}`, html);
}

function reRollBottleDice(losses, totalCrew) {
    let roll = Math.floor(Math.random() * 6) + 1;
    let total = roll + losses;
    let failed = total > totalCrew;
    let diceEl = document.getElementById('bottle-dice-val');
    let totalEl = document.getElementById('bottle-total-val');
    let verdictEl = document.getElementById('bottle-verdict');
    if (diceEl) diceEl.innerText = roll;
    if (totalEl) {
        totalEl.innerText = total;
        totalEl.style.color = failed ? '#ef4444' : '#10b981';
    }
    if (verdictEl) {
        verdictEl.innerText = failed 
            ? `❌ Échec théorique (${total} > ${totalCrew}) — Le gang déroute !` 
            : `✓ Réussite théorique (${total} ≤ ${totalCrew}) — Le gang tient bon !`;
        verdictEl.style.color = failed ? '#ef4444' : '#10b981';
    }
}

function resolveBottleCheck(isSuccess) {
    if (isSuccess) {
        gameState.bottleCheckedThisRound = true;
        gameState.fightersOOAThisRound = [];
        gameState.round += 1;
        gameState.crew.forEach(f => {
            if (f.state !== 'out_of_action' && f.state !== 'fled') {
                f.isActivated = false;
            }
        });
        closeModal();
        showToast(`✓ Test de Déroute réussi ! Le gang reste soudé. Début du Round ${gameState.round}.`, "success");
        renderCombatView(document.getElementById('main-content'));
    } else {
        openFleeingSelectionModal();
    }
}

function openFleeingSelectionModal() {
    window._selectedFleeingFighterIds = [];
    let eligibleFighters = gameState.crew.filter(c => c.state !== 'out_of_action' && c.state !== 'fled');

    if (eligibleFighters.length === 0) {
        showToast("Aucun combattant valide ne reste sur la table pour fuir.", "error");
        gameState.bottleCheckedThisRound = true;
        gameState.fightersOOAThisRound = [];
        gameState.round += 1;
        closeModal();
        renderCombatView(document.getElementById('main-content'));
        return;
    }

    let html = `
        <div style="padding:4px 0;">
            <div style="background:#241216; border:1px solid #ef4444; border-radius:6px; padding:12px 14px; margin-bottom:14px;">
                <h4 style="color:#ef4444; margin:0 0 6px 0; font-size:15px;">
                    ❌ Test de Déroute Raté — Fuite de Combattants
                </h4>
                <p style="color:#cbd5e1; font-size:13px; margin:0 0 8px 0;">
                    Le gang a craqué face aux pertes. Sélectionnez <strong>1 ou 2 combattants</strong> qui fuient la bataille.
                </p>
                <div style="background:#141014; border-left:3px solid #ef4444; padding:8px 12px; border-radius:4px;">
                    <span style="color:#fca5a5; font-weight:bold; font-size:13px;">Consigne d'attribution obligatoire :</span><br>
                    <span style="color:#fff; font-size:13px; font-weight:bold; font-style:italic;">
                        « En priorité les guerriers non engagés, sinon les engagés, sinon les sérieusement blessés »
                    </span>
                </div>
            </div>

            <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                <span style="font-size:13px; color:#94a3b8;">Cochez 1 ou 2 fuyards parmi les guerriers sur la table :</span>
                <span id="flee-selection-count" style="font-size:13px; font-weight:bold; color:var(--accent-cyan);">0 / 2 sélectionnés</span>
            </div>

            <div style="max-height:45vh; overflow-y:auto; margin-bottom:14px; padding-right:4px;">
                ${eligibleFighters.map(f => {
                    let isSI = f.state === 'seriously_injured';
                    let isEng = !!f.isEngaged;
                    let priorityLabel = isSI 
                        ? '🔴 Priorité 3 : Sérieusement blessé' 
                        : (isEng ? '🟠 Priorité 2 : Engagé' : '🟢 Priorité 1 : Non engagé');
                    let priorityColor = isSI ? '#ef4444' : (isEng ? '#f59e0b' : '#10b981');

                    return `
                        <div class="fighter-item" style="background:#141820; border:1px solid #242b38; padding:10px 12px; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <label style="cursor:pointer; display:flex; align-items:center; gap:10px; width:100%;">
                                <input type="checkbox" id="flee-box-${f.id}" onchange="toggleFleeingFighter('${f.id}')" style="transform:scale(1.3); cursor:pointer;">
                                <div>
                                    <strong style="color:#fff; font-size:14px;">${escapeHtml(f.customName || f.charName)}</strong>
                                    <span style="color:#94a3b8; font-size:12px;">(${f.charName})</span><br>
                                    <span style="font-size:11px; padding:1px 6px; border-radius:3px; font-weight:bold; background:${priorityColor}22; color:${priorityColor}; border:1px solid ${priorityColor};">
                                        ${priorityLabel}
                                    </span>
                                    ${isSI ? `
                                        <span style="color:#ef4444; font-size:11px; margin-left:6px;">⚠️ Devra lancer séquelle (blessé grave avant fuite)</span>
                                    ` : `
                                        <span style="color:#10b981; font-size:11px; margin-left:6px;">🛡️ Protégé (aucun jet de séquelle)</span>
                                    `}
                                </div>
                            </label>
                            <button class="btn" style="padding:4px 8px; font-size:11px; white-space:nowrap; margin:0;" onclick="toggleFighterEngaged('${f.id}')" title="Marquer si ce guerrier est au corps à corps">
                                ${isEng ? '⚔️ Engagé' : 'Non engagé'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
                <button id="btn-confirm-flee" class="btn-danger" style="padding:10px; font-weight:bold; font-size:14px; margin:0; opacity:0.7;" onclick="confirmFleeingFighters()">
                    🏃 Confirmer la Fuite (0 sélectionné) & Démarrer le Round suivant
                </button>
            </div>
        </div>
    `;

    openModal("❌ Sélection des Fuyards — Déroute", html);
}

function toggleFighterEngaged(fighterId) {
    let f = gameState.crew.find(c => c.id === fighterId);
    if (f) {
        f.isEngaged = !f.isEngaged;
        openFleeingSelectionModal();
    }
}

function toggleFleeingFighter(fighterId) {
    if (!window._selectedFleeingFighterIds) window._selectedFleeingFighterIds = [];
    let idx = window._selectedFleeingFighterIds.indexOf(fighterId);
    let box = document.getElementById(`flee-box-${fighterId}`);

    if (idx >= 0) {
        window._selectedFleeingFighterIds.splice(idx, 1);
    } else {
        if (window._selectedFleeingFighterIds.length >= 2) {
            showToast("Vous ne pouvez sélectionner que 1 ou 2 fuyards.", "error");
            if (box) box.checked = false;
            return;
        }
        window._selectedFleeingFighterIds.push(fighterId);
    }

    let countEl = document.getElementById('flee-selection-count');
    let btnEl = document.getElementById('btn-confirm-flee');
    let count = window._selectedFleeingFighterIds.length;
    if (countEl) {
        countEl.innerText = `${count} / 2 sélectionnés`;
    }
    if (btnEl) {
        btnEl.innerText = `🏃 Confirmer la Fuite (${count} sélectionné${count > 1 ? 's' : ''}) & Démarrer le Round suivant`;
        btnEl.style.opacity = (count >= 1 && count <= 2) ? '1' : '0.7';
    }
}

function confirmFleeingFighters() {
    if (!window._selectedFleeingFighterIds || window._selectedFleeingFighterIds.length < 1) {
        showToast("Veuillez cocher au moins 1 combattant (1 ou 2 au maximum) qui fuit.", "error");
        return;
    }
    if (window._selectedFleeingFighterIds.length > 2) {
        showToast("Au maximum 2 combattants peuvent fuir.", "error");
        return;
    }

    let count = window._selectedFleeingFighterIds.length;
    window._selectedFleeingFighterIds.forEach(id => {
        let f = gameState.crew.find(c => c.id === id);
        if (f) {
            if (f.state === 'seriously_injured') {
                f.wasSeriouslyInjuredBeforeFleeing = true;
            } else {
                f.wasSeriouslyInjuredBeforeFleeing = false;
            }
            f.state = 'fled';
            f.isActivated = true;
        }
    });

    gameState.bottleCheckedThisRound = true;
    gameState.fightersOOAThisRound = [];
    gameState.round += 1;
    gameState.crew.forEach(f => {
        if (f.state !== 'out_of_action' && f.state !== 'fled') {
            f.isActivated = false;
        }
    });

    closeModal();
    showToast(`${count} combattant(s) ont fui ! Début du Round ${gameState.round}.`, "info");
    renderCombatView(document.getElementById('main-content'));
}

function toggleChoirBuff(fIdx, active) {
    if (!gameState.crew[fIdx]) return;
    gameState.crew[fIdx].choirActive = active;
    renderCombatView(document.getElementById('main-content'));
}

function openCombatTacticsModal() {
    let html = `
        <h3>Cartes Tactiques en Main (${gameState.tacticsHand.length})</h3>
        <div style="max-height:55vh; overflow-y:auto;">
    `;
    if (gameState.tacticsHand.length === 0) {
        html += `<p style="color:#aaa;">Aucune carte en main.</p>`;
    } else {
        gameState.tacticsHand.forEach((t, idx) => {
            html += `
                <div style="background:#141820; border:1px solid #242b38; padding:10px; border-radius:6px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:var(--accent-cyan);">${t.name}</strong>
                        <button class="btn-danger" style="padding:2px 8px; font-size:11px; margin:0;" onclick="playTacticsCard(${idx})">Jouer la carte</button>
                    </div>
                    <small style="color:var(--accent-secondary); font-weight:bold;">${t.timing}</small><br>
                    <small style="color:#ddd;">${t.effect}</small>
                </div>
            `;
        });
    }
    html += `</div><br><button class="btn" onclick="closeModal()">Fermer</button>`;
    openModal("Cartes Tactiques", html);
}

function playTacticsCard(idx) {
    let played = gameState.tacticsHand.splice(idx, 1)[0];
    closeModal();
    showToast(`Carte jouée : ${played.name}`, "info");
    renderCombatView(document.getElementById('main-content'));
}

function confirmEndBattle() {
    showConfirmModal(
        "Terminer la Bataille",
        `Voulez-vous clôturer cette bataille Delaque ?<br><br>
        ${appState.isQuickMatch 
            ? 'La partie rapide sera fermée sans conséquence de blessures permanentes.' 
            : 'Tous les combattants conserveront leur XP acquise (+1 participation + accomplissements). Les blessures et convalescences seront calculées en Post-Bataille.'}`,
        "Terminer",
        () => {
            endBattle();
        }
    );
}

function endBattle() {
    if (appState.isQuickMatch) {
        showToast("Partie rapide terminée !");
        navigate('gang-manage');
        return;
    }

    // 1. Attribution et conservation intégrale de l'XP pour TOUS les combattants
    // Un guerrier ne peut JAMAIS perdre l'XP acquise pendant la partie.
    // Même s'il finit Hors de combat ou Fuyard, il conserve l'XP de participation (+1) et ses accomplissements.
    let recap = [];
    gameState.crew.forEach(f => {
        let gangMember = currentGang.members.find(m => m.id === f.id);
        if (gangMember) {
            let participationXP = 1;
            let featsXP = f.matchXP || 0;
            let totalGained = participationXP + featsXP;
            let prevXP = gangMember.xp || 0;
            gangMember.xp = prevXP + totalGained;

            // Traitement médical et blessures permanentes :
            // Les fuyards sont protégés et ne subissent pas les conséquences d'une mise hors de combat
            // (pas de jet de blessure permanente), sauf s'ils étaient déjà sérieusement blessés avant de fuir.
            if (f.state === 'out_of_action') {
                gangMember.recovery = true;
                gangMember.critInj = true; // Séquelle permanente à tirer
            } else if (f.state === 'fled') {
                if (f.wasSeriouslyInjuredBeforeFleeing) {
                    gangMember.recovery = true;
                    gangMember.critInj = true; // Séquelle requise car blessé grave avant de fuir
                } else {
                    // Protégé ! Pas de séquelle
                    gangMember.recovery = false;
                    gangMember.critInj = false;
                }
            }

            recap.push({
                id: f.id,
                name: f.customName || f.charName,
                charName: f.charName,
                state: f.state,
                wasSeriouslyInjuredBeforeFleeing: f.wasSeriouslyInjuredBeforeFleeing,
                participationXP: participationXP,
                featsXP: featsXP,
                totalGained: totalGained,
                newTotalXP: gangMember.xp
            });
        }
    });

    gameState.lastBattleRecap = recap;
    window.gameState = gameState;
    saveGangs();

    showToast("Bataille terminée ! L'XP et les blessures ont été enregistrées.", "success");
    if (typeof renderPostCycleView === 'function') {
        renderPostCycleView(document.getElementById('main-content'));
    } else {
        navigate('gang-manage');
    }
}

window.renderGameSetup = renderGameSetup;
window.resetSetupState = resetSetupState;
window.startBattle = startBattle;
window.renderCombatView = renderCombatView;
window.togglePriority = togglePriority;
window.nextRound = nextRound;
window.handleEndOfRoundClick = handleEndOfRoundClick;
window.setFighterState = setFighterState;
window.toggleChoirBuff = toggleChoirBuff;
window.openCombatTacticsModal = openCombatTacticsModal;
window.playTacticsCard = playTacticsCard;
window.confirmEndBattle = confirmEndBattle;
window.openBottleCheckModal = openBottleCheckModal;
window.reRollBottleDice = reRollBottleDice;
window.resolveBottleCheck = resolveBottleCheck;
window.openFleeingSelectionModal = openFleeingSelectionModal;
window.toggleFighterEngaged = toggleFighterEngaged;
window.toggleFleeingFighter = toggleFleeingFighter;
window.confirmFleeingFighters = confirmFleeingFighters;
window.cancelFighterFled = cancelFighterFled;
window.addFighterMatchXP = addFighterMatchXP;
window.showOOAReminderModal = showOOAReminderModal;
