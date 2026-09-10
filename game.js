// game.js - Gestion des Parties (Campagne & Rapide), Suivi du Combat, Règle Psychoteric Choir et Déroulement du Match

let gameState = {
    isQuickMatch: false,
    crew: [],
    round: 1,
    priority: 'player', // 'player' or 'enemy'
    bottleTested: false,
    bottledOut: false,
    tacticsHand: [],
    log: []
};

function resetSetupState() {
    gameState = {
        isQuickMatch: appState.isQuickMatch || false,
        crew: [],
        round: 1,
        priority: 'player',
        bottleTested: false,
        bottledOut: false,
        tacticsHand: [],
        log: []
    };
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
        state: 'ready', // 'ready', 'active', 'pinned', 'seriously_injured', 'out_of_action', 'broken', 'hidden'
        isActivated: false,
        choirActive: false // Delaque Psychoteric Choir buff
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

    renderCombatView(document.getElementById('main-content'));
}

function renderCombatView(container) {
    let standingCount = gameState.crew.filter(c => c.state !== 'out_of_action').length;
    let ooaCount = gameState.crew.filter(c => c.state === 'out_of_action').length;
    let totalCount = gameState.crew.length;
    let bottleThreshold = Math.ceil(totalCount / 2);
    let shouldTestBottle = ooaCount >= bottleThreshold;

    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-bottom:1px solid #242b38; padding-bottom:10px; margin-bottom:12px;">
                <div>
                    <h2 style="margin:0;">Tableau de Combat — Round ${gameState.round}</h2>
                    <span style="font-size:13px; color:#94a3b8;">
                        Priorité : <strong style="color:${gameState.priority === 'player' ? 'var(--accent-cyan)' : 'var(--accent-purple)'};">${gameState.priority === 'player' ? 'Delaque (Vous)' : 'Ennemi'}</strong> | 
                        Combattants actifs : <strong style="color:#10b981;">${standingCount}/${totalCount}</strong> | 
                        Hors de combat : <strong style="color:#ef4444;">${ooaCount}</strong>
                    </span>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button class="btn btn-cyan" onclick="togglePriority()">Changer Priorité</button>
                    <button class="btn" onclick="nextRound()">Round Suivant ⏩</button>
                    <button class="btn-danger" onclick="confirmEndBattle()">Terminer la Bataille</button>
                </div>
            </div>

            ${shouldTestBottle ? `
                <div style="background:#261313; border:1px solid #ef4444; border-radius:6px; padding:10px 14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color:#ef4444; font-size:14px;">⚠️ Test de Déroute (Bottle Test) Requis !</strong><br>
                        <span style="font-size:12px; color:#fca5a5;">Plus de la moitié du gang (${ooaCount}/${totalCount}) est hors de combat ou blessée grièvement.</span>
                    </div>
                    <button class="btn-danger" style="margin:0; padding:6px 14px;" onclick="testBottle()">Faire le Test (D6 + OOA)</button>
                </div>
            ` : ''}

            <div style="background:#0f131a; border:1px solid var(--accent-purple); border-radius:6px; padding:10px 14px; margin-bottom:15px; font-size:13px; display:flex; justify-content:space-between; align-items:center;">
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
    let isSeriouslyInjured = fighter.state === 'seriously_injured';
    let isPinned = fighter.state === 'pinned';
    let isBroken = fighter.state === 'broken';

    let ldStat = parseInt(fighter.stats.Ld) || 7;
    let willStat = parseInt(fighter.stats.Wil) || 7;
    if (fighter.choirActive) {
        ldStat = Math.max(2, ldStat - 1); // Dans Necromunda les tests de Ld et Will sont en X+, donc +1 Ld diminue la valeur requise (ex 7+ devient 6+)
        willStat = Math.max(2, willStat - 1);
    }

    return `
        <div style="background:#10141c; border:1px solid ${isOOA ? '#ef4444' : (fighter.isActivated ? '#334155' : 'var(--accent-cyan)')}; border-radius:6px; padding:12px; opacity:${isOOA ? '0.55' : '1'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div>
                    <strong style="font-size:15px; color:#fff;">${escapeHtml(fighter.customName || fighter.charName)}</strong>
                    <br><span style="font-size:11px; color:#94a3b8;">${fighter.charName} ${fighter.isWyrd ? '• 🔮 Wyrd' : ''}</span>
                </div>
                <span style="font-size:11px; padding:2px 8px; border-radius:10px; font-weight:bold; background:${fighter.isActivated ? '#334155' : '#10b981'}; color:#fff;">
                    ${fighter.isActivated ? 'Activé' : 'Prêt'}
                </span>
            </div>

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
            <div style="margin-bottom:8px; font-size:12px; display:flex; align-items:center; justify-content:space-between; background:#161c28; padding:4px 8px; border-radius:4px;">
                <label style="cursor:pointer; display:flex; align-items:center; gap:6px; color:#fdba74;">
                    <input type="checkbox" ${fighter.choirActive ? 'checked' : ''} onchange="toggleChoirBuff(${fIdx}, this.checked)">
                    Choir (+1 Ld/Wil)
                </label>
                <span style="font-size:11px; color:#888;">${fighter.fleshWounds} chair blessée</span>
            </div>

            <!-- State controls -->
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
                <button class="btn" style="padding:3px 6px; font-size:11px; ${isPinned ? 'background:#d97706;' : ''}" onclick="setFighterState(${fIdx}, '${isPinned ? 'ready' : 'pinned'}')">📌 Pinned</button>
                <button class="btn" style="padding:3px 6px; font-size:11px; ${isSeriouslyInjured ? 'background:#b91c1c;' : ''}" onclick="setFighterState(${fIdx}, '${isSeriouslyInjured ? 'ready' : 'seriously_injured'}')">🩸 Blessé Grave</button>
                <button class="btn-danger" style="padding:3px 6px; font-size:11px; ${isOOA ? 'background:#7f1d1d;' : ''}" onclick="setFighterState(${fIdx}, 'out_of_action')">💀 Hors de Combat</button>
                <button class="btn" style="padding:3px 6px; font-size:11px; ${fighter.isActivated ? 'background:#475569;' : 'background:#10b981;'}" onclick="toggleFighterActivation(${fIdx})">${fighter.isActivated ? 'Désactiver' : 'Activer'}</button>
            </div>

            <!-- Armes et Pouvoirs -->
            <div style="font-size:12px; color:#cbd5e1; border-top:1px solid #1e2532; padding-top:6px;">
                <div><strong style="color:var(--accent-cyan);">Armes :</strong> ${(fighter.weapons || []).map(w => w.name).join(', ') || 'Aucune'}</div>
                ${fighter.isWyrd ? `
                    <div style="margin-top:4px;">
                        <strong style="color:var(--accent-purple);">Pouvoirs :</strong> 
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

function togglePriority() {
    gameState.priority = gameState.priority === 'player' ? 'enemy' : 'player';
    renderCombatView(document.getElementById('main-content'));
}

function nextRound() {
    gameState.round += 1;
    gameState.crew.forEach(f => {
        if (f.state !== 'out_of_action') {
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
    gameState.crew[fIdx].state = newState;
    if (newState === 'out_of_action') {
        gameState.crew[fIdx].isActivated = true;
    }
    renderCombatView(document.getElementById('main-content'));
}

function toggleChoirBuff(fIdx, active) {
    if (!gameState.crew[fIdx]) return;
    gameState.crew[fIdx].choirActive = active;
    renderCombatView(document.getElementById('main-content'));
}

function testBottle() {
    let roll = Math.floor(Math.random() * 6) + 1;
    let ooaCount = gameState.crew.filter(c => c.state === 'out_of_action').length;
    let total = roll + ooaCount;
    let html = `
        <div style="padding:10px;">
            <h3>Test de Déroute (Bottle Test)</h3>
            <p>Résultat du dé : <strong>${roll}</strong> + Pertes (${ooaCount}) = <strong style="color:var(--accent-cyan); font-size:18px;">${total}</strong></p>
            <p style="color:#aaa; font-size:13px;">Si ce total est supérieur au nombre de combattants initiaux (${gameState.crew.length}), le gang déroute (Bottle out) et devra tester le Sang-Froid (Cool) à chaque tour pour rester sur la table.</p>
            <button class="btn btn-cyan" onclick="closeModal()">Fermer</button>
        </div>
    `;
    openModal("Test de Déroute", html);
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
                        <button class="btn-danger" style="padding:2px 8px; font-size:11px;" onclick="playTacticsCard(${idx})">Jouer la carte</button>
                    </div>
                    <small style="color:var(--accent-purple); font-weight:bold;">${t.timing}</small><br>
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
        ${appState.isQuickMatch ? 'La partie rapide sera fermée sans conséquence de blessures permanentes.' : 'Les blessures et le passage en Post-Bataille seront calculés.'}`,
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

    // Sauvegarder les blessures du combat sur le gang pour le post-cycle
    let ooaFighters = gameState.crew.filter(c => c.state === 'out_of_action');
    ooaFighters.forEach(f => {
        let gangMember = currentGang.members.find(m => m.id === f.id);
        if (gangMember) {
            gangMember.recovery = true;
        }
    });

    saveGangs();
    showToast("Bataille terminée ! Passage à la séquence de Post-Cycle.", "success");
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
window.setFighterState = setFighterState;
window.toggleChoirBuff = toggleChoirBuff;
window.testBottle = testBottle;
window.openCombatTacticsModal = openCombatTacticsModal;
window.playTacticsCard = playTacticsCard;
window.confirmEndBattle = confirmEndBattle;
