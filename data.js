// data.js - Base de données Necromunda (Delaque, Mercenaires, Armes, Équipements, Traits, Cartes Tactiques, Territoires, Conditions)

const db = {
    // ===== PERSONNAGES =====
    characters: [
        {
            id: "char_master_of_shadows",
            name: "Master of shadows",
            stats: { M: '5"', WS: '3+', BS: '3+', S: 3, T: 3, W: 3, I: 4, A: 3, Sv: '5+', Ld: 8, Cl: 8, Wil: 9, Int: 8 },
            type: ["guerrier", "leader"],
            starting_xp: 61,
            starting_skill: "Au choix parmi les primaires",
            special_rules: ["Psychoteric choir : quand ce guerrier se trouve à 3\" ou moins de deux alliés Delaque ou plus, son Ld et son Will augmentent de 1."],
            primary_skills: ["ruse", "savant"],
            secondary_skills: ["agilité", "tir"],
            cost: 140,
            tactics_cards: 2,
            wyrd_option: { cost: 35, unlocks_type: "wyrd", unlocks_category: "psychoteric_wyrd", label: "Wyrd (+35 crédits) : débloque le type wyrd et 1 compétence Psychoteric wyrd au choix, en plus de la compétence primaire de départ." }
        },
        {
            id: "char_phantom",
            name: "Phantom",
            stats: { M: '5"', WS: '3+', BS: '3+', S: 3, T: 3, W: 2, I: 4, A: 2, Sv: '5+', Ld: 7, Cl: 7, Wil: 8, Int: 7 },
            type: ["guerrier", "champion"],
            starting_xp: 37,
            starting_skill: "Au choix parmi les primaires",
            special_rules: ["Psychoteric choir : quand ce guerrier se trouve à 3\" ou moins de deux alliés Delaque ou plus, son Ld et son Will augmentent de 1."],
            primary_skills: ["ruse", "savant"],
            secondary_skills: ["agilité"],
            cost: 100,
            tactics_cards: 1,
            wyrd_option: { cost: 35, unlocks_type: "wyrd", unlocks_category: "psychoteric_wyrd", label: "Wyrd (+35 crédits) : débloque le type wyrd et 1 compétence Psychoteric wyrd au choix, en plus de la compétence primaire de départ." }
        },
        {
            id: "char_nacht_ghul",
            name: "Nacht-Ghul",
            stats: { M: '6"', WS: '3+', BS: '4+', S: 4, T: 3, W: 2, I: 5, A: 3, Sv: '5+', Ld: 6, Cl: 8, Wil: 8, Int: 7 },
            type: ["guerrier", "champion", "solitaire"],
            starting_xp: 49,
            starting_skill: "From the shadows, et au choix parmi les primaires",
            special_rules: [
                "Psychoteric choir : quand ce guerrier se trouve à 3\" ou moins de deux alliés Delaque ou plus, son Ld et son Will augmentent de 1.",
                "From the shadows : au lieu de déployer ce guerrier normalement, il peut être gardé de côté. Au début de n'importe quel round après le premier, avant le jet de priorité, il peut être déployé n'importe où sur le terrain, hors de ligne de vue et à plus de 9\" de tout ennemi."
            ],
            primary_skills: ["agilité", "combat"],
            secondary_skills: ["ruse"],
            cost: 120,
            tactics_cards: 1
        },
        {
            id: "char_ghost",
            name: "Ghost",
            stats: { M: '5"', WS: '4+', BS: '4+', S: 3, T: 3, W: 1, I: 4, A: 1, Sv: '6+', Ld: 6, Cl: 6, Wil: 7, Int: 6 },
            type: ["guerrier", "ganger", "spécialiste"],
            starting_xp: 13,
            starting_skill: "Une au choix parmi les 8 des spécialistes",
            special_rules: [
                "Psychoteric choir : quand ce guerrier se trouve à 3\" ou moins de deux alliés Delaque ou plus, son Ld et son Will augmentent de 1.",
                "lourd (Bulging biceps), artilleur (Hip-shooting), pistolero (Gunfighter), scout (Clamber), sniper (Precision shot), bagarreur (Berserker), medic (Medicate), tech (Munitioneer)"
            ],
            primary_skills: ["ruse"],
            secondary_skills: ["agilité", "savant"],
            cost: 45,
            tactics_cards: 0
        },
        {
            id: "char_psy_gheist",
            name: "Psy-Gheist",
            stats: { M: '6"', WS: '5+', BS: '5+', S: 3, T: 3, W: 1, I: 4, A: 1, Sv: '6+', Ld: 5, Cl: 6, Wil: 7, Int: 5 },
            type: ["guerrier", "prospect", "wyrd"],
            starting_xp: 4,
            starting_skill: "Un pouvoir Psychoteric wyrd au choix",
            special_rules: ["Psychoteric choir : quand ce guerrier se trouve à 3\" ou moins de deux alliés Delaque ou plus, son Ld et son Will augmentent de 1."],
            primary_skills: ["ruse"],
            secondary_skills: ["agilité"],
            cost: 30,
            tactics_cards: 0
        },
        {
            id: "char_shadow",
            name: "Shadow",
            stats: { M: '6"', WS: '5+', BS: '5+', S: 3, T: 3, W: 1, I: 4, A: 1, Sv: '6+', Ld: 5, Cl: 5, Wil: 6, Int: 5 },
            type: ["guerrier", "prospect"],
            starting_xp: 1,
            starting_skill: "",
            special_rules: ["Psychoteric choir : quand ce guerrier se trouve à 3\" ou moins de deux alliés Delaque ou plus, son Ld et son Will augmentent de 1."],
            primary_skills: ["ruse"],
            secondary_skills: ["agilité"],
            cost: 25,
            tactics_cards: 0
        },
        {
            id: "char_piscean_spektor",
            name: "Piscean Spektor",
            stats: { M: '5"', WS: '3+', BS: '5+', S: 4, T: 4, W: 4, I: 4, A: 2, Sv: '5+', Ld: 6, Cl: 7, Wil: 7, Int: 5 },
            type: ["guerrier", "bête", "brute", "volant", "wyrd"],
            starting_xp: 25,
            starting_skill: "Une compétence Psychoteric wyrd au choix",
            special_rules: [
                "Psychoteric choir : quand ce guerrier se trouve à 3\" ou moins de deux alliés Delaque ou plus, son Ld et son Will augmentent de 1.",
                "Équipé de base de Psychomantic claws (arme exclusive, masquée aux autres guerriers).",
                "Ne peut jamais acheter d'arme, d'armure, d'équipement ou d'accessoire d'arme."
            ],
            primary_skills: ["muscle"],
            secondary_skills: ["combat"],
            cost: 250,
            tactics_cards: 0,
            default_weapons: ["wpn_psychomantic_claws"],
            no_purchases: true
        },
        {
            id: "char_cephalopod_spektor",
            name: "Cephalopod Spektor",
            stats: { M: '5"', WS: '4+', BS: '5+', S: 2, T: 3, W: 1, I: 4, A: 1, Sv: '6+', Ld: 6, Cl: 7, Wil: 7, Int: 7 },
            type: ["guerrier", "bête", "volant", "familier"],
            starting_xp: 13,
            starting_skill: "Leash de 3\"",
            special_rules: [
                "Sensor array : si le Cephalopod Spektor est dans la distance de leash de son maître quand celui-ci fait un test d'Int, celui-ci lance un dé de plus et garde le meilleur.",
                "Équipé de base de Shock Tendrils (arme exclusive, masquée aux autres guerriers).",
                "Ne peut jamais acheter d'arme ou d'équipement.",
                "Compte comme équipement"
            ],
            primary_skills: ["ruse"],
            secondary_skills: ["agilité"],
            cost: 75,
            is_gang: true,
            default_weapons: ["wpn_shock_tendrils"],
            no_purchases: true
        },
        {
            id: "char_psychoteric_wyrm",
            name: "Psychoteric wyrm",
            stats: { M: '6"', WS: '4+', BS: '6+', S: 2, T: 3, W: 1, I: 3, A: 1, Sv: '6+', Ld: 5, Cl: 6, Wil: 7, Int: 5 },
            type: ["guerrier", "bête", "familier"],
            starting_xp: 13,
            starting_skill: "Leash de 12\"",
            special_rules: [
                "Psychoteric node : quand son maître utilise un pouvoir Psychoteric wyrd en étant à portée de leash, il peut lancer son pouvoir depuis le Psychoteric wyrm.",
                "Burrowing : peut se déplacer sous les terrains infranchissables.",
                "Équipé de base de Ferocious jaws (arme exclusive, masquée aux autres guerriers).",
                "Ne peut jamais acheter d'arme ou d'équipement.",
                "Compte comme équipement"
            ],
            primary_skills: ["agilité"],
            secondary_skills: ["ruse"],
            cost: 50,
            is_gang: true,
            default_weapons: ["wpn_ferocious_jaws"],
            no_purchases: true
        }
    ],

    // ===== DICTIONNAIRE DES COMPETENCES =====
    skills: {
        agilite: [
            { id: "sk_chute_chat", name: "Catfall", desc: "Réduit le cran de distance verticale en cas de chute/saut. Test d'agilité pour ne pas être suppressed si non blessé/hors combat." },
            { id: "sk_grimper", name: "Clamber", desc: "Mouvement non divisé par deux en grimpant." },
            { id: "sk_esquive", name: "Dodge", desc: "Avant jet d'armure, sur un 6, ignore la blessure. Si gabarit, déplace de 2\" pour éviter." },
            { id: "sk_bond_prodigieux", name: "Mighty leap", desc: "Ignore les 2 premiers pouces de distance lors d'un saut (saut 4\" sans test)." },
            { id: "sk_jaillir", name: "Spring up", desc: "Si suppressed, test d'agilité. Si réussi, n'est plus suppressed." },
            { id: "sk_sprint", name: "Sprint", desc: "Action double : déplacement = Mouvement + (2 x Initiative)." }
        ],
        muscle: [
            { id: "sk_charge_taureau", name: "Bull charge", desc: "Attaque de charge : l'arme gagne knockback (6+) et +1 en Force." },
            { id: "sk_biceps_saillants", name: "Bulging biceps", desc: "Braced shot : déplacement d'Initiative en pouces avant ou après. Arme lourde au close : peut déclarer arme secondaire non lourde." },
            { id: "sk_redoutable", name: "Fearsome", desc: "Condition fearsome." },
            { id: "sk_machoire_acier", name: "Iron jaw", desc: "Endurance +2 si touché par arme sans AP." },
            { id: "sk_nerfs_acier", name: "Nerves of steel", desc: "Si touché au tir, test de cool : si réussi, non suppressed." },
            { id: "sk_instoppable", name: "Unstoppable", desc: "A l'activation, test de Willpower : si réussi, récupère 1 PV." }
        ],
        combat: [
            { id: "sk_berserker", name: "Berserker", desc: "Condition frénésie." },
            { id: "sk_maitre_combat", name: "Combat master", desc: "Pas de malus d'interférence pour toucher. Peut toujours assister quel que soit le nb d'ennemis." },
            { id: "sk_coup_boule", name: "Headbutt", desc: "Arme intégrée : engagé, F+1, L:1, attaques additionnelles (1)." },
            { id: "sk_coups_puissants", name: "Heavy blows", desc: "Arme lourde au close = +1 Force." },
            { id: "sk_pluie_coups", name: "Rain of blows", desc: "Si après une action d'attaque, le guerrier est toujours engagé, peut faire une action d'attaque gratuite en plus." },
            { id: "sk_combat_2_armes", name: "Two-weapon fighter", desc: "Fait 2 attaques avec son arme secondaire au lieu d'une." }
        ],
        ruse: [
            { id: "sk_backstab", name: "Backstab", desc: "Armes close gagnent Backstab. Si déjà acquis, Force +2 au lieu de +1." },
            { id: "sk_contre_attaque", name: "Counter-attack", desc: "Peut faire une attaque additionnelle quand un ennemi l'attaque, au même rang d'initiative que lui." },
            { id: "sk_coupe_gorge", name: "Cut-throat", desc: "Relance son D6 de coup de grâce." },
            { id: "sk_infiltration", name: "Infiltrate", desc: "Déploiement spécial : hors ligne de vue et à + de 9\" de tout ennemi." },
            { id: "sk_se_cacher", name: "Lie low", desc: "Si suppressed, inciblable au-delà de la portée courte des ennemis." },
            { id: "sk_overwatch", name: "Overwatch", desc: "Interrompt une action ennemie avec un tir en perdant son marqueur ready." }
        ],
        savant: [
            { id: "sk_connecte", name: "Connected", desc: "Visite le Trading Post avec 1 TP supplémentaire post-cycle (2 visites max)." },
            { id: "sk_recharge_rapide", name: "Fast reload", desc: "Recharge toutes ses armes d'un coup." },
            { id: "sk_volonte_fer", name: "Iron will", desc: "Soustrait 1 aux tests de bottle check du gang." },
            { id: "sk_soin", name: "Medicate", desc: "Action : un allié à 1\" qui n'est pas seriously injured récupère 1 PV." },
            { id: "sk_mentor", name: "Mentor", desc: "Si un allié à 6\" gagne 1 XP, test de Ld : si réussi, gagne 1 XP." },
            { id: "sk_munitions", name: "Munitioneer", desc: "Action distribution : alliés à 6\" font test d'Int, si réussi -> recharge gratuite." }
        ],
        tir: [
            { id: "sk_tir_rapide", name: "Fast shot", desc: "Peut faire 2 actions de tir pendant l'activation." },
            { id: "sk_pistolero", name: "Gunfighter", desc: "Peut tirer avec 2 armes de tir (léger) sur cibles différentes." },
            { id: "sk_tir_hanche", name: "Hip-shooting", desc: "Les armes de tir (non lourdes) gagnent le trait assaut." },
            { id: "sk_tireur_habile", name: "Marksman", desc: "+1 pour toucher les cibles entre portée courte et longue." },
            { id: "sk_tir_precision", name: "Precision shot", desc: "Sur un 6 naturel pour toucher, ignore l'armure (sauf explosion/tir rapide)." },
            { id: "sk_tireur_elite", name: "Sharpshooter", desc: "Aimed shot : +2 pour toucher au lieu de +1." }
        ],
        psychoteric_wyrd: [
            { id: "sk_psychotic_lure", name: "Psychotic Lure", desc: "Action simple : choisis un ennemi en ligne de vue dans les 6\" avec un marqueur prêt. Il devra être obligatoirement activé au prochain tour de l'adversaire et ne pourra pas faire d'activation de groupe." },
            { id: "sk_terrible_truths", name: "Terrible truths", desc: "Action simple : choisis un ennemi en ligne de vue dans les 6\", qui doit réussir un test de Will sous peine de recevoir la condition folie." },
            { id: "sk_deceitful_thoughts", name: "Deceitful Thoughts", desc: "Action double : choisis un ennemi en ligne de vue dans les 6\", il doit réussir un jet de Will, faute de quoi le joueur du wyrd peut le déplacer immédiatement de son M." },
            { id: "sk_cacophony_silence", name: "Cacophony of silence", desc: "Action simple, effet continu : tant que cet effet est maintenu, tous les ennemis en ligne de vue dans les 6\" doivent relancer leurs jets réussis pour toucher au tir." },
            { id: "sk_perfect_void", name: "A perfect void", desc: "Action gratuite, effet continu : tant que ce pouvoir est maintenu, le wyrd compte comme étant toujours à couvert et à portée longue des armes de tir de tous les ennemis dans les 10\"." },
            { id: "sk_eternal_slumber", name: "Eternal slumber", desc: "Action simple : choisis un ennemi sérieusement blessé en ligne de vue dans les 3\", il est immédiatement mis hors de combat." }
        ],
        generique: [
            { id: "sk_poison_blood", name: "Poison blood", desc: "Quand le guerrier utilise une arme avec le trait toxine (X+), les résultats de 1 peuvent être relancés." },
            { id: "sk_lands_on_feet", name: "Lands on their feet", desc: "Si le guerrier tombe pour n'importe quelle raison, réduire de 3\" la hauteur de chute dans le tableau.", specific_to: "char_phyrr_cat" },
            { id: "sk_hit_run", name: "Hit & run", desc: "Après action de combat, peut consolider (sortir de 1\") en finissant à +1\" des ennemis." },
            { id: "sk_inspirant", name: "Inspirant", desc: "Peut faire l'action d'activation de groupe en action gratuite." },
            { id: "sk_chef", name: "Chef", desc: "Tous les alliés dans les 12\" et en ligne de vue peuvent utiliser le Cl du leader pour leurs tests de nerf." },
            { id: "sk_sous_chef", name: "Sous-chef", desc: "Tous les alliés dans les 6\" et en ligne de vue peuvent utiliser le Cl du leader pour leurs tests de nerf." },
            { id: "sk_juggernaut", name: "Juggernaut", desc: "Si touché au tir, suppressed uniquement si PV perdu ou effet du dé de blessure.", specific_to: "brute" },
            { id: "sk_regeneration", name: "Regeneration", desc: "Action : mouvement puis 4+ = récupère 1 PV." },
            { id: "sk_leash", name: "Leash de X\"", desc: "Portée pour familiers pour ignorer le test de panique." }
        ]
    },

    // ===== ARMES =====
    weapons: [
        // --- Armes de tir ---
        { id: "wpn_autogun", name: "Autogun", profiles: [{ name: "Unique", SR: '8"', LR: '24"', S: 3, AP: "-", L: 1, traits: "Tir rapide (1)" }], cost_credits: 20, cost_tp: 0, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_autopistol", name: "Autopistol", profiles: [{ name: "Unique", SR: '4"', LR: '12"', S: 3, AP: "-", L: 1, traits: "Léger, tir rapide (1)" }], cost_credits: 10, cost_tp: 0, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_heavy_stubber", name: "Heavy stubber*", profiles: [{ name: "Unique", SR: '20"', LR: '40"', S: 4, AP: "-1", L: 1, traits: "Lourd, tir rapide (2)" }], cost_credits: 70, cost_tp: 2, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_long_rifle", name: "Long rifle", profiles: [{ name: "Unique", SR: '24"', LR: '48"', S: 4, AP: "-1", L: 1, traits: "Knockback (6+)" }], cost_credits: 55, cost_tp: 1, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_stub_gun", name: "Stub gun", profiles: [{ name: "Unique", SR: '6"', LR: '12"', S: 3, AP: "-", L: 1, traits: "Léger" }], cost_credits: 5, cost_tp: 0, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_boltgun", name: "Boltgun", profiles: [{ name: "Unique", SR: '12"', LR: '24"', S: 4, AP: "-1", L: 2, traits: "Tir rapide (1), munitions (3+)" }], cost_credits: 55, cost_tp: 2, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_bolt_pistol", name: "Bolt pistol", profiles: [{ name: "Unique", SR: '6"', LR: '12"', S: 4, AP: "-1", L: 2, traits: "Tir rapide (1), munitions (3+), léger" }], cost_credits: 45, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_heavy_bolter", name: "Bolter lourd*", profiles: [{ name: "Unique", SR: '18"', LR: '36"', S: 5, AP: "-2", L: 2, traits: "Munitions (3+), lourd, tir rapide (2)" }], cost_credits: 100, cost_tp: 3, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_warpstorm_bolter", name: "Warpstorm bolter", profiles: [{ name: "Unique", SR: '12"', LR: '24"', S: 4, AP: "-1", L: 2, traits: "Munitions (6+), tir rapide (1), rare (4+), maudit" }], cost_credits: 65, cost_tp: 4, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_lance_flamme", name: "Lance flamme", profiles: [{ name: "Unique", SR: "T", LR: "-", S: 4, AP: "-1", L: 1, traits: "Munitions (6+), flammes (5+), gabarit" }], cost_credits: 70, cost_tp: 1, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_pist_lance_flamme", name: "Pistolet lance flamme", profiles: [{ name: "Unique", SR: "T", LR: "-", S: 3, AP: "-", L: 1, traits: "Munitions (6+), flammes (5+), gabarit, léger" }], cost_credits: 45, cost_tp: 1, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_lance_flamme_lourd", name: "Lance flamme lourd*", profiles: [{ name: "Unique", SR: "T", LR: "-", S: 5, AP: "-2", L: 1, traits: "Munitions (6+), flammes (5+), gabarit" }], cost_credits: 95, cost_tp: 2, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_grav_gun", name: "Grav gun", profiles: [{ name: "Unique", SR: '9"', LR: '18"', S: "-", AP: "-", L: 2, traits: "Munitions (5+), explosion (3\"), graviton pulse" }], cost_credits: 50, cost_tp: 4, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_grav_pistol", name: "Grav pistol", profiles: [{ name: "Unique", SR: '4"', LR: '9"', S: "-", AP: "-", L: 2, traits: "Munitions (5+), explosion (3\"), graviton pulse" }], cost_credits: 40, cost_tp: 3, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_grenade_launcher", name: "Lance grenade", profiles: [
            { name: "Frag", SR: '6"', LR: '24"', S: 3, AP: "-", L: 1, traits: "Munitions (4+), explosion (3\"), knockback (5+)" },
            { name: "Krak", SR: '6"', LR: '24"', S: 6, AP: "-2", L: 1, traits: "Munitions (4+)" }
        ], cost_credits: 80, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_lasgun", name: "Lasgun", profiles: [{ name: "Unique", SR: '16"', LR: '24"', S: 3, AP: "-", L: 1, traits: "" }], cost_credits: 15, cost_tp: 0, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_laspistol", name: "Laspistol", profiles: [{ name: "Unique", SR: '8"', LR: '12"', S: 3, AP: "-", L: 1, traits: "Léger" }], cost_credits: 5, cost_tp: 0, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_long_las", name: "Long Las", profiles: [{ name: "Unique", SR: '18"', LR: '36"', S: 4, AP: "-", L: 1, traits: "" }], cost_credits: 40, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_fuseur", name: "Fuseur", profiles: [{ name: "Unique", SR: '6"', LR: '12"', S: 8, AP: "-4", L: 3, traits: "Munitions (6+), dommages (3)" }], cost_credits: 140, cost_tp: 4, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_multifuseur", name: "Multi fuseur*", profiles: [{ name: "Unique", SR: '12"', LR: '24"', S: 8, AP: "-4", L: 3, traits: "Munitions (6+), dommages (3), lourd" }], cost_credits: 150, cost_tp: 4, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_canon_plasma", name: "Canon plasma*", profiles: [{ name: "Unique", SR: '18"', LR: '36"', S: 6, AP: "-2", L: 2, traits: "Munitions (6+), explosion (3\"), dommages (2), lourd, instable" }], cost_credits: 115, cost_tp: 4, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_fusil_plasma", name: "Fusil plasma", profiles: [{ name: "Unique", SR: '12"', LR: '24"', S: 5, AP: "-2", L: 2, traits: "Munitions (6+), dommages (2), tir rapide (1), instable" }], cost_credits: 85, cost_tp: 3, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_pistolet_plasma", name: "Pistolet plasma", profiles: [{ name: "Unique", SR: '6"', LR: '12"', S: 5, AP: "-2", L: 2, traits: "Munitions (6+), dommages (2), léger, instable" }], cost_credits: 70, cost_tp: 3, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_couteau_lancer", name: "Couteau de lancer", profiles: [{ name: "Unique", SR: '6"', LR: '12"', S: "-", AP: "-", L: 1, traits: "Munitions (3+), toxine (4+)" }], cost_credits: 10, cost_tp: 0, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_canon_rad", name: "Rad Cannon*", profiles: [{ name: "Unique", SR: '16"', LR: '32"', S: 3, AP: "-1", L: 1, traits: "Munitions (4+), explosion (3\"), lourd, rad-phage" }], cost_credits: 55, cost_tp: 4, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_fusil_rad", name: "Rad gun", profiles: [{ name: "Unique", SR: "T", LR: "-", S: 3, AP: "-1", L: 1, traits: "Munitions (5+), gabarit, rad-phage" }], cost_credits: 60, cost_tp: 3, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_lance_harpon", name: "Lance harpon*", profiles: [{ name: "Unique", SR: '6"', LR: '18"', S: 5, AP: "-3", L: 1, traits: "Munitions (5+), attirer" }], cost_credits: 80, cost_tp: 3, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_cutter_laser", name: "Las cutter", profiles: [{ name: "Unique", SR: '2"', LR: '4"', S: 9, AP: "-2", L: 2, traits: "Dommages (2), léger, tir unique" }], cost_credits: 80, cost_tp: 3, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_laser_minage", name: "Laser de minage*", profiles: [{ name: "Unique", SR: '10"', LR: '14"', S: 9, AP: "-3", L: 3, traits: "Munitions (5+), dommages (2), lourd" }], cost_credits: 125, cost_tp: 3, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_pompe_combat", name: "Fusil à pompe de combat", profiles: [
            { name: "Salve", SR: '4"', LR: '12"', S: 4, AP: "-", L: 1, traits: "Knockback (6+)" },
            { name: "Déchiquetant", SR: "T", LR: "-", S: 3, AP: "-", L: 1, traits: "Munitions (6+), tir rapide (1), déchiqueter (6+), gabarit" }
        ], cost_credits: 35, cost_tp: 1, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_pompe_canon_scie", name: "Fusil à pompe à canon scié", profiles: [
            { name: "Dispersion", SR: '4"', LR: '8"', S: 2, AP: "-", L: 1, traits: "Léger, tir rapide (1)" },
            { name: "Concentré", SR: '4"', LR: '8"', S: 4, AP: "-", L: 1, traits: "Léger, knockback (6+)" }
        ], cost_credits: 30, cost_tp: 1, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_fusil_pompe", name: "Fusil à pompe", profiles: [
            { name: "Dispersion", SR: '4"', LR: '8"', S: 3, AP: "-", L: 1, traits: "Tir rapide (2)" },
            { name: "Concentré", SR: '8"', LR: '16"', S: 4, AP: "-", L: 1, traits: "Knockback (5+)" }
        ], cost_credits: 35, cost_tp: 0, is_gang_weapon: true, is_hive_scum: true },
        { id: "wpn_pist_aiguille", name: "Pistolet à aiguille", profiles: [{ name: "Unique", SR: '4"', LR: '9"', S: "-", AP: "-", L: 1, traits: "Léger, toxine (3+)" }], cost_credits: 25, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_fusil_aiguille", name: "Fusil à aiguille", profiles: [{ name: "Unique", SR: '9"', LR: '18"', S: "-", AP: "-1", L: 1, traits: "Toxine (3+)" }], cost_credits: 45, cost_tp: 2, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_fusil_web", name: "Fusil web", profiles: [{ name: "Unique", SR: "T", LR: "-", S: 5, AP: "-", L: "-", traits: "Munitions (6+), gabarit, toile" }], cost_credits: 65, cost_tp: 4, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_pistolet_web", name: "Pistolet web", profiles: [{ name: "Unique", SR: "T", LR: "-", S: 4, AP: "-", L: "-", traits: "Munitions (6+), gabarit, toile, léger" }], cost_credits: 50, cost_tp: 3, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_flechette_pistol", name: "Flechette Pistol", profiles: [{ name: "Unique", SR: '4"', LR: '12"', S: "-", AP: "-", L: 1, traits: "Léger, toxine (3+), tir rapide (1)" }], cost_credits: 35, cost_tp: 0, is_gang_weapon: true, is_hive_scum: false },

        // --- Grenades ---
        { id: "wpn_grenade_explo", name: "Grenade explosive", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '6"', S: 5, AP: "-1", L: 2, traits: "Munitions (5+), explosion (5\"), knockback (5+), limité" }], cost_credits: 60, cost_tp: 2, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_grenade_gaz", name: "Grenade à gaz asphyxiant", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: "-", AP: "-", L: 1, traits: "Munitions (5+), explosion (3\"), gaz, limité, toxine (3+)" }], cost_credits: 45, cost_tp: 1, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_charge_demo", name: "Charge de démolition", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '6"', S: 6, AP: "-3", L: 3, traits: "Munitions (6+), explosion (5\"), dommages (2), limité" }], cost_credits: 85, cost_tp: 3, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_grenade_frag", name: "Grenades frag", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: 3, AP: "-", L: 1, traits: "Munitions (4+), explosion (3\"), knockback (6+), limité" }], cost_credits: 30, cost_tp: 0, is_gang_weapon: false, is_gang: false, is_hive_scum: true, counts_as_equip: true },
        { id: "wpn_grenade_inc", name: "Grenades incendiaires", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: 3, AP: "-", L: 1, traits: "Munitions (5+), explosion (5\"), flammes (5+), limité" }], cost_credits: 40, cost_tp: 2, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_grenade_krak", name: "Grenades krak", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: 6, AP: "-2", L: 1, traits: "Munitions (4+), limité" }], cost_credits: 45, cost_tp: 1, is_gang_weapon: false, is_gang: false, is_hive_scum: true, counts_as_equip: true },
        { id: "wpn_grenade_phos", name: "Grenades à phosphore", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: 4, AP: "-2", L: 2, traits: "Munitions (5+), explosion (3\"), flammes (5+), limité, instable" }], cost_credits: 65, cost_tp: 3, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_grenade_photon", name: "Grenades à photon", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: "-", AP: "-", L: "-", traits: "Munitions (4+), explosion (5\"), flash, limité" }], cost_credits: 15, cost_tp: 1, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_grenade_plasma", name: "Grenades à plasma", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: 5, AP: "-1", L: 2, traits: "Munitions (4+), explosion (3\"), dommages (2), limité, instable" }], cost_credits: 70, cost_tp: 3, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_grenade_rad", name: "Grenades rad", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: 2, AP: "-1", L: 1, traits: "Munitions (4+), explosion (3\"), limité, rad-phage" }], cost_credits: 25, cost_tp: 1, is_gang_weapon: false, is_gang: false, is_hive_scum: false, counts_as_equip: true },
        { id: "wpn_grenade_fumi", name: "Grenades fumigène", type: "Grenade", profiles: [{ name: "Unique", SR: "-", LR: '9"', S: "-", AP: "-", L: "-", traits: "Munitions (4+), explosion (3\"), limité, fumée" }], cost_credits: 15, cost_tp: 0, is_gang_weapon: true, is_gang: true, is_hive_scum: true, counts_as_equip: true },

        // --- Corps à corps ---
        { id: "wpn_hache_tron", name: "Hache tronçonneuse", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-1", L: 1, traits: "Melee, déchiqueter (5+)" }], cost_credits: 20, cost_tp: 1, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_epee_tron", name: "Epée tronçonneuse", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-", L: 1, traits: "Melee, déchiqueter (5+), parade" }], cost_credits: 20, cost_tp: 1, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_hache_nrj", name: "Hache énergétique", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-3", L: 1, traits: "Melee, brêche (5+)" }], cost_credits: 40, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_gantelet_nrj", name: "Gantelet énergétique", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+3", AP: "-3", L: 2, traits: "Melee, brêche (6+), commotion (5+), dommages (2), encombrant" }], cost_credits: 105, cost_tp: 3, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_marteau_nrj", name: "Marteau énergétique", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-2", L: 2, traits: "Melee, brêche (6+), commotion (6+)" }], cost_credits: 40, cost_tp: 2, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_couteau_nrj", name: "Couteau énergétique", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-2", L: 1, traits: "Melee, backstab, brêche (6+)" }], cost_credits: 30, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_masse_nrj", name: "Masse énergétique", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-2", L: 1, traits: "Melee, brêche (6+), commotion (6+)" }], cost_credits: 45, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_epee_nrj", name: "Epée énergétique", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-2", L: 1, traits: "Melee, brêche (6+), parade" }], cost_credits: 40, cost_tp: 2, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_hache", name: "Hache", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-1", L: 1, traits: "Melee" }], cost_credits: 15, cost_tp: 0, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_couteau_combat", name: "Couteau de combat", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-", L: 1, traits: "Melee, backstab" }], cost_credits: 5, cost_tp: 0, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_fleau", name: "Fléau", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-", L: 1, traits: "Melee, knockback (6+)" }], cost_credits: 10, cost_tp: 0, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_masse", name: "Masse", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-", L: 1, traits: "Melee, commotion (6+)" }], cost_credits: 20, cost_tp: 0, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_hache_2m", name: "Hache à deux mains*", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-1", L: 2, traits: "Melee, lourd, encombrant" }], cost_credits: 40, cost_tp: 1, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_marteau_2m", name: "Marteau à deux mains*", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-", L: 3, traits: "Melee, commotion (6+), lourd, encombrant" }], cost_credits: 40, cost_tp: 1, is_gang_weapon: false, is_hive_scum: true },
        { id: "wpn_servo_claw", name: "Servo-claw", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+2", AP: "-", L: 2, traits: "Melee, encombrant" }], cost_credits: 40, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_baton_shock", name: "Shock baton", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-", L: 1, traits: "Melee, parade, shock (6+)" }], cost_credits: 20, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_arme_hast_shock", name: "Arme d'hast shock", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-", L: 1, traits: "Melee, shock (5+)" }], cost_credits: 25, cost_tp: 1, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_fouet_shock", name: "Fouet shock", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S", AP: "-", L: 1, traits: "Melee, knockback (6+), shock (6+)" }], cost_credits: 10, cost_tp: 1, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_couteau_stylet", name: "Couteau stylet", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "-", AP: "-", L: 1, traits: "Melee, toxine (3+)" }], cost_credits: 25, cost_tp: 2, is_gang_weapon: true, is_hive_scum: false },
        { id: "wpn_epee_stylet", name: "Epée stylet", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "-", AP: "-1", L: 1, traits: "Melee, parade, toxine (3+)" }], cost_credits: 45, cost_tp: 2, is_gang_weapon: false, is_hive_scum: false },
        { id: "wpn_web_gauntlet", name: "Web Gauntlet", profiles: [{ name: "Unique", SR: "E", LR: "-", S: 3, AP: "-", L: "-", traits: "Backstab, Melee, toile" }], cost_credits: 10, cost_tp: 0, is_gang_weapon: true, is_hive_scum: false },

        // --- Armes exclusives à certains profils ---
        { id: "wpn_psychomantic_claws", name: "Psychomantic claws", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-3", L: 1, traits: "Melee, paire (2)" }], cost_credits: 65, cost_tp: 0, is_gang_weapon: true, is_hive_scum: false, specific_to: ["char_psy_gheist", "char_piscean_spektor"] },
        { id: "wpn_serpents_fangs", name: "Serpent's fangs", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "-", AP: "-3", L: 1, traits: "Melee, paire (2), toxine (3+)" }], cost_credits: 70, cost_tp: 0, is_gang_weapon: true, is_hive_scum: false, specific_to: "char_nacht_ghul" },
        { id: "wpn_shivver_sword", name: "Shivver sword", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-1", L: 2, traits: "Melee, parade" }], cost_credits: 50, cost_tp: 0, is_gang_weapon: false, is_hive_scum: false, specific_to: "char_nacht_ghul" },
        { id: "wpn_ferocious_jaws", name: "Ferocious jaws", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-1", L: 1, traits: "Melee, déchirant (6+)" }], cost_credits: 0, cost_tp: 0, is_gang_weapon: true, is_hive_scum: false, default_for: "char_psychoteric_wyrm", specific_to: "char_psychoteric_wyrm" },
        { id: "wpn_shock_tendrils", name: "Shock Tendrils", profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-", L: 1, traits: "Melee, shock (6+)" }], cost_credits: 0, cost_tp: 0, is_gang_weapon: true, is_hive_scum: false, default_for: "char_cephalopod_spektor", specific_to: "char_cephalopod_spektor" }
    ],

    // ===== EQUIPEMENTS =====
    equipment: [
        // --- Armures ---
        { id: "eq_armure_cara_leg", name: "Armure carapace légère", type: "Armure", cost_credits: 100, cost_tp: 1, effect: "Améliore la sauvegarde de 1. Réduit l'initiative de 1." },
        { id: "eq_armure_cara_lourde", name: "Armure carapace lourde", type: "Armure", cost_credits: 140, cost_tp: 3, effect: "Améliore la sauvegarde de 2. Réduit l'initiative de 2. Malus aux jets d'agilité de -1." },
        { id: "eq_hazard_suit", name: "Hazard suit", type: "Armure", cost_credits: 10, cost_tp: 0, effect: "Immunisé aux traits flammes (X+) et rad-phage.", is_hive_scum: true },
        { id: "eq_mesh_armour", name: "Mesh armour", type: "Armure", cost_credits: 40, cost_tp: 0, effect: "Améliore sauvegarde de 1 au corps à corps.", is_gang: true },
        { id: "eq_nuage_reflec", name: "Reflec shroud", type: "Armure", cost_credits: 25, cost_tp: 1, effect: "AP des armes las, plasma et fuseur = '-'" },
        { id: "eq_refractor_shield", name: "Refractor shield", type: "Armure", cost_credits: 50, cost_tp: 2, effect: "Sauvegarde invulnérable de 5+. Au 1er jet de 1, ne fonctionne plus. Peut être combinée avec les autres armures.", is_gang: true },

        // --- Personnel ---
        { id: "eq_bio_booster", name: "Bio-booster", type: "Personnel", cost_credits: 25, cost_tp: 0, effect: "1ère fois blessé : réduit léthalité de 1 (si 0, jette 2 dés et choisit)." },
        { id: "eq_corde_descente", name: "Drop rig", type: "Personnel", cost_credits: 10, cost_tp: 0, effect: "Action descendre : 12\" vertical, 3\" horizontal.", is_hive_scum: true },
        { id: "eq_lance_grappin", name: "Grapnel launcher", type: "Personnel", cost_credits: 25, cost_tp: 0, effect: "Action grappin : déplace 12\" ligne droite, doit finir plus haut.", is_gang: true },
        { id: "eq_grav_chute", name: "Grav-chute", type: "Personnel", cost_credits: 30, cost_tp: 0, effect: "Chute sans dommage, jamais suppressed." },
        { id: "eq_kit_medical", name: "Medicae kit", type: "Personnel", cost_credits: 20, cost_tp: 0, effect: "Soigne un allié, jette 2 dés de recovery et garde au choix.", is_gang: true },
        { id: "eq_lunettes_infra", name: "Photo-goggles", type: "Personnel", cost_credits: 35, cost_tp: 0, effect: "Visibilité +9\", voit dans fumée. Malus -2 init si munition flash.", is_gang: true, is_hive_scum: true },
        { id: "eq_lampe_frontale", name: "Photo-lumens", type: "Personnel", cost_credits: 15, cost_tp: 0, effect: "Visibilité +9\" mais toujours ciblable." },
        { id: "eq_respirateur", name: "Respirateur", type: "Personnel", cost_credits: 15, cost_tp: 0, effect: "Save 5+ invulnérable contre le gaz.", is_gang: true },
        { id: "eq_servo_partiel", name: "Servo-harness partial", type: "Personnel", cost_credits: 100, cost_tp: 2, effect: "+2 Force, +1 Endurance (peut dépasser le max). Malus -1 Mvt et Init. Incompatible servo-claw et servo-harness full." },
        { id: "eq_servo_total", name: "Servo-harness full", type: "Personnel", cost_credits: 130, cost_tp: 3, effect: "Idem partiel sans malus. Incompatible servo-claw et servo-harness partial." },
        { id: "eq_stimm_slug", name: "Stimm-slug stash", type: "Personnel", cost_credits: 25, cost_tp: 0, effect: "1/bataille : +2 M, S, T. A la prochaine activation : 2+ aucun effet, 1 = prend une blessure." },
        { id: "eq_dirt_bike", name: "Dirt bike", type: "Personnel", cost_credits: 35, cost_tp: 0, effect: "Devient monté. M = 8\", Dash = 5\".", is_gang: true },
        { id: "eq_psychomancers_harness", name: "Psychomancer's harness", type: "Personnel", cost_credits: 35, cost_tp: 0, effect: "M +2\". Grimper à la verticale ne divise pas le mouvement par 2.", is_gang: true },

        { id: "eq_medicrane", name: "Medicrane", type: "Personnel", cost_credits: 0, effect: "Figurine à 1\", T3 Sv6+. Soigne en action gratuite.", specific_to: "merc_rogue_doc" },

        // --- Accessoires d'arme ---
        { id: "eq_cristal_concen", name: "Focusing crystal", type: "Accessoire", cost_credits: 25, cost_tp: 1, effect: "AP +1. Arme devient instable." },
        { id: "eq_hotshot", name: "Hotshot las pack", type: "Accessoire", cost_credits: 25, cost_tp: 1, effect: "Force +1" },
        { id: "eq_viseur_infra", name: "Infra-sight", type: "Accessoire", cost_credits: 10, cost_tp: 0, effect: "Tire à travers fumée. Visibilité +9\"." },
        { id: "eq_viseur_laser", name: "Las-projector", type: "Accessoire", cost_credits: 20, cost_tp: 1, effect: "Réduit bonus de couvert de 1 à portée courte." },
        { id: "eq_viseur", name: "Mono-sight", type: "Accessoire", cost_credits: 20, cost_tp: 0, effect: "Aimed shot : bonus +2 au lieu de +1." },
        { id: "eq_suspenseur", name: "Suspensors", type: "Accessoire", cost_credits: 40, cost_tp: 0, effect: "Arme avec * compte pour 1 emplacement au lieu de 2." },
        { id: "eq_viseur_longue", name: "Telescopic sight", type: "Accessoire", cost_credits: 20, cost_tp: 1, effect: "Réduit bonus de couvert de 1 sur portée longue.", is_gang: true, is_hive_scum: true }
    ],

    // ===== RÈGLES DES ACCESSOIRES =====
    accessory_rules: {
        max_per_weapon: 1,
        unequip_to_stash: true,
        desc: "Chaque arme ne peut recevoir qu'un seul accessoire. Si une arme est déséquipée et envoyée dans le stash, son accessoire aussi."
    },

    // ===== TRAITS DES ARMES =====
    weapon_traits: [
        { id: "trait_arc", name: "Arc (X)", desc: "Une arme avec ce trait a un champ de tir limité, indiqué par X." },
        { id: "trait_assaut", name: "Assaut", desc: "Après que l'utilisateur a fait une action de dash, il peut tirer en action gratuite." },
        { id: "trait_attaques_add", name: "Attaques additionnelles (X)", desc: "L'arme peut faire X attaques supplémentaires en plus des attaques normales. Uniquement pendant l'activation et si l'arme n'est pas choisie comme arme primaire ou secondaire." },
        { id: "trait_attirer", name: "Attirer", desc: "Si une figurine est touchée par une arme ayant ce trait mais pas mise hors de combat, l'attaquant peut essayer de l'attirer. Il lance un D6, et si cela dépasse la force de la cible, elle est attirée de D3\". Si elle rencontre une autre figurine, elle est attirée aussi. Si la cible finit dans les 1\" d'un de ses ennemis, elle est déplacée pour être engagée avec lui." },
        { id: "trait_auxilliaire", name: "Auxilliaire", desc: "Une arme avec ce trait ne peut qu'être attachée à une autre arme et jamais prise seule. Elle n'utilise pas d'emplacement d'arme." },
        { id: "trait_backstab", name: "Backstab", desc: "Cette arme gagne +1 en force si l'adversaire est engagé avec plus d'un ennemi." },
        { id: "trait_belier", name: "Bélier", desc: "Une arme avec ce trait ne peut être utilisée que lors d'une charge." },
        { id: "trait_bouclier", name: "Bouclier", desc: "Si la figurine est équipée avec au moins une arme ayant ce trait, elle augmente sa sauvegarde de 1 contre les tirs." },
        { id: "trait_breche", name: "Breche (X+)", desc: "Si le jet de blessure donne X ou +, il ne peut y avoir de jet d'armure." },
        { id: "trait_combi", name: "Combi", desc: "Quand on tire avec cette arme, le personnage peut choisir quel profil il utilise. Il peut aussi tirer avec les deux, mais avec une pénalité de -1 pour toucher." },
        { id: "trait_commotion", name: "Commotion (X+)", desc: "Si l'attaquant blesse son adversaire et que le jet de blessure est de X ou +, l'initiative de la cible baisse de 1 jusqu'à la fin de sa prochaine activation." },
        { id: "trait_dechiqueter", name: "Déchiqueter (X+)", desc: "Lors du jet de blessure avec cette arme, si le résultat est de X ou +, la léthalité de l'arme augmente de 1." },
        { id: "trait_dechirant", name: "Déchirant (X+)", desc: "Si le jet naturel d'une blessure avec cette arme est X ou plus, augmenter l'AP de 1." },
        { id: "trait_dommages", name: "Dommages (X)", desc: "Si un guerrier est blessé par cette arme, il perd X PV au lieu d'un. S'il faut faire un jet de dé de blessure, on ne lance que la léthalité de cette arme, quel que soit le nombre de PV perdu." },
        { id: "trait_encombrant", name: "Encombrant", desc: "Au corps à corps, les attaques avec cette arme se font avec une initiative de 1." },
        { id: "trait_explosion", name: "Explosion (3\"/5\")", desc: "Placer le gabarit correspondant sur la cible du tir. Si la touche rate, le gabarit se déplace de D6\" dans la direction indiquée par le dé de dispersion. Si le dé de dispersion indique un hit et le dé une valeur de 1, le tir est annulé." },
        { id: "trait_fiable", name: "Fiable", desc: "Une arme avec ce trait ignore le premier résultat à court de munitions obtenu à chaque round." },
        { id: "trait_flammes", name: "Flammes (X+)", desc: "Si le jet pour blesser donne X ou plus, on effectue une touche supplémentaire, même s'il n'y a pas de blessure. Faire un nouveau jet de blessure pour cette nouvelle touche." },
        { id: "trait_flash", name: "Flash", desc: "Si une cible est touchée par une arme avec flash, on ne jette pas de jet de blessure, mais d'initiative. S'il est raté, la figurine subit la condition aveugle (perd son token prêt)." },
        { id: "trait_fumee", name: "Fumée", desc: "Cette arme ne cible pas une figurine, mais un point sur le champ de bataille. Une colonne de fumée s'élève à cet endroit, bloquant les lignes de vue." },
        { id: "trait_gabarit", name: "Gabarit", desc: "Quand un tir est réalisé avec cette arme, placer le gabarit en larme. Toute figurine sous le gabarit est automatiquement touchée." },
        { id: "trait_gaz", name: "Gaz", desc: "Un guerrier ne peut faire de jet d'armure contre les armes ayant ce trait. Les guerriers équipés d'un respirateur ont une sauvegarde invulnérable de 5+ contre ces armes." },
        { id: "trait_graviton_pulse", name: "Graviton pulse", desc: "Au lieu de lancer un jet de blessure, la cible doit faire un test de force. S'il est raté, la figurine subit une blessure sans sauvegarde." },
        { id: "trait_independant", name: "Indépendant", desc: "Le porteur de cette arme ne peut pas tirer avec. À la place, elle tire en même temps que son porteur, en pouvant avoir une autre cible (touche toujours sur 4+)." },
        { id: "trait_instable", name: "Instable", desc: "Si le jet pour toucher avec cette arme donne 1, le guerrier maniant cette arme subit une touche automatique avec le profil de l'arme." },
        { id: "trait_jumelee", name: "Jumelée", desc: "Lors d'un tir avec cette arme, le dé de tir rapide peut être relancé." },
        { id: "trait_knockback", name: "Knockback (X+)", desc: "Si cette arme touche avec un résultat de X ou plus, la cible est repoussée de 1\", ce qui peut la faire tomber ou la désengager." },
        { id: "trait_lance", name: "Lance", desc: "Si le guerrier portant cette arme est monté, il ajoute +1 en force à ses attaques de charge." },
        { id: "trait_lance_bombe", name: "Lance-bombe", desc: "La première touche de la partie avec cette arme est résolue avec son profil primed, toutes les autres avec son profil utilisé." },
        { id: "trait_leger", name: "Léger", desc: "Cette arme peut être utilisée en tant qu'arme primaire ou secondaire au corps à corps, mais ne pourra faire qu'une seule attaque." },
        { id: "trait_limite", name: "Limité", desc: "Si cette arme tombe à court de munitions, elle ne peut plus être utilisée pour cette partie." },
        { id: "trait_lourd", name: "Lourd", desc: "Une arme avec ce trait ne peut tirer qu'en utilisant l'action braced shot. Une arme de corps à corps avec ce trait ne peut pas être utilisée en arme secondaire." },
        { id: "trait_maudit", name: "Maudit", desc: "Un guerrier touché par une arme maudite doit réussir un test de willpower ou subir la condition folie (insanity)." },
        { id: "trait_melee", name: "Melee", desc: "Cette arme ne peut être utilisée que quand on est engagé au corps à corps." },
        { id: "trait_munitions", name: "Munitions (X+)", desc: "Après le tir avec cette arme, lancer un D6. Si le résultat est inférieur à X, l'arme est à court de munitions." },
        { id: "trait_paire", name: "Paire (X)", desc: "Quand on attaque avec cette arme, on ajoute X attaques supplémentaires." },
        { id: "trait_parade", name: "Parade", desc: "Quand cette arme est utilisée au corps à corps, la sauvegarde augmente de 1." },
        { id: "trait_power_pack", name: "Power pack", desc: "Ne compte pas dans la limite d'armes portées (max 2 avec ce trait)." },
        { id: "trait_rad_phage", name: "Rad-phage", desc: "Quand un guerrier subit une blessure non sauvegardée d'une arme avec ce trait, il devient empoisonné aux radiations (-1 Endurance)." },
        { id: "trait_rare", name: "Rare (X+)", desc: "Lors de l'action de recharge, il faut lancer un D6 (réussi sur X+)." },
        { id: "trait_shock", name: "Shock (X+)", desc: "Lors du jet pour toucher, si le résultat est X+, on considère que le jet de blessure donne 6." },
        { id: "trait_temeraire", name: "Téméraire", desc: "Peut toucher toute figurine en ligne de vue dans les 6\", même amie, à déterminer aléatoirement." },
        { id: "trait_tir_rapide", name: "Tir rapide (X)", desc: "Ajoute le dé de tir rapide (nombre de touches potentielles et risque de court de munitions)." },
        { id: "trait_tir_unique", name: "Tir unique", desc: "Ne peut tirer qu'une fois par partie sans pouvoir être rechargée." },
        { id: "trait_toile", name: "Toile", desc: "Pas de sauvegarde d'armure (sauf invulnérable). La cible blessée gagne la condition entoilé." },
        { id: "trait_toxine", name: "Toxine (X+)", desc: "Lors du jet de blessure, on ignore l'endurance de la cible, blessée sur X+." }
    ],

    // ===== CARTES TACTIQUES (18) =====
    tactics: [
        { id: "tac_point_blank_shot", name: "Point-blank shot", timing: "Quand un guerrier s'active, avant ses actions", effect: "Une des armes du guerrier qui n'a pas les traits explosions ou template gagne le trait léger." },
        { id: "tac_hidden_stash", name: "Hidden stash", timing: "Quand un guerrier s'active, avant ses actions", effect: "Pendant son activation, ce guerrier peut faire gratuitement une action de recharge." },
        { id: "tac_suppressing_fire", name: "Suppressing fire", timing: "Quand un guerrier tire", effect: "La cible est suppressed même si elle n'est pas touchée. Les compétences ne peuvent empêcher le suppressed." },
        { id: "tac_burst_of_courage", name: "Burst of courage", timing: "Avant de faire un bottle check", effect: "Le test est automatiquement réussi." },
        { id: "tac_adrenaline_surge", name: "Adrenaline surge", timing: "Quand un guerrier s'active, avant ses actions", effect: "Le guerrier peut faire une action supplémentaire." },
        { id: "tac_desperate_effort", name: "Desperate effort", timing: "Juste avant de choisir quel guerrier va s'activer", effect: "Activer le guerrier comme s'il avait un marqueur prêt. À la fin de son activation, il est suppressed et subit une blessure qu'on ne peut sauvegarder ou empêcher." },
        { id: "tac_grenade_bouquet", name: "Grenade bouquet", timing: "Quand un guerrier tire avec une grenade ayant le trait explosion", effect: "Le guerrier résout 3 attaques ciblant le même ennemi. Elles dévient toutes et l'arme devient à court de munitions." },
        { id: "tac_quick_finish", name: "Quick finish", timing: "Quand un guerrier s'active, avant ses actions", effect: "Le guerrier peut faire un coup de grâce en action gratuite." },
        { id: "tac_remorseless_killer", name: "Remorseless killer", timing: "Quand un guerrier fait un coup de grâce, avant de jeter les dés", effect: "L'ennemi est directement out of combat sans jet de dé." },
        { id: "tac_last_gap", name: "Last gap", timing: "Quand un guerrier reçoit l'état out of action", effect: "Le guerrier peut immédiatement faire un tir avant d'être retiré du terrain." },
        { id: "tac_thundering_charge", name: "Thundering charge", timing: "Quand un guerrier déclare une charge, avant de jeter le dé de distance", effect: "Lancer 2 dés et choisir lequel garder pour la distance de charge." },
        { id: "tac_chain_attack", name: "Chain attack", timing: "Quand un guerrier a résolu un combat et n'est plus engagé", effect: "Le guerrier peut immédiatement effectuer une charge gratuite même s'il a déjà charged ce tour. La distance de charge sera de D6+2\"." },
        { id: "tac_opening_volley", name: "Opening volley", timing: "Avant le premier round et le jet de priorité", effect: "Un guerrier peut immédiatement effectuer un tir sans perdre son état prêt." },
        { id: "tac_you", name: "You !", timing: "Quand un guerrier s'active, avant ses actions", effect: "Désigner un guerrier ennemi, le guerrier aura +1 pour blesser cet ennemi pour toute la partie. Tant que l'ennemi est sur la table, le guerrier ne peut prendre que lui pour cible de ses actions." },
        { id: "tac_rapid_healing", name: "Rapid healing", timing: "Quand un guerrier s'active, avant ses actions", effect: "Le guerrier récupère immédiatement 1 PV perdu." },
        { id: "tac_reckless_attack", name: "Reckless attack", timing: "Quand un guerrier s'active, avant ses actions", effect: "Pour son activation, le guerrier a +1 à sa WS. Jusqu'à sa prochaine activation, il sera touché sur un 2+ au corps à corps." },
        { id: "tac_rapid_fire", name: "Rapid fire", timing: "Quand un guerrier s'active, avant ses actions", effect: "Durant son activation, ce guerrier peut faire une action de tir gratuitement (pas une en plus)." },
        { id: "tac_crossfire", name: "Crossfire", timing: "Quand un guerrier s'active, avant ses actions", effect: "Si ce guerrier fait une attaque de tir sur un ennemi qui a déjà été pris pour cible par un allié à ce round, le tir touche automatiquement." }
    ],

    // ===== TERRITOIRES (19) =====
    territories: [
        { id: "ter_settlement", name: "Settlement", income: 15, optionType: "discount_ganger", optionText: "Option : Recruter un ganger (-25 cr sur coût)", desc: "Revenu : 15 cr OU recruter un ganger pour 25 cr de moins." },
        { id: "ter_bullet_den", name: "Bullet den", income: 15, optionType: "discount_ammojack", optionText: "Option : Recruter un Ammo-jack (-30 cr sur coût)", desc: "Revenu : 15 cr OU recruter un Ammo-jack pour 30 cr de moins." },
        { id: "ter_rogue_doc_shop", name: "Rogue doc shop", income: 15, optionType: "discount_doc", optionText: "Option : Recruter un Rogue doc (-30 cr sur coût)", desc: "Revenu : 15 cr OU recruter un Rogue doc pour 30 cr de moins." },
        { id: "ter_mess_shack", name: "Mess Shack", income: 15, optionType: "discount_slopper", optionText: "Option : Recruter un Slopper (-30 cr sur coût)", desc: "Revenu : 15 cr OU recruter un Slopper pour 30 cr de moins." },
        { id: "ter_drinking_hole", name: "Drinking hole", income: 15, optionType: "discount_watcher", optionText: "Option : Recruter un Hive watcher (-30 cr sur coût)", desc: "Revenu : 15 cr OU recruter un Hive watcher pour 30 cr de moins." },
        { id: "ter_fence_hangout", name: "Fence hangout", income: 15, optionType: "discount_runner", optionText: "Option : Recruter un Dome runner (-30 cr sur coût)", desc: "Revenu : 15 cr OU recruter un Dome runner pour 30 cr de moins." },
        { id: "ter_bounty_den", name: "Bounty den", income: 25, desc: "Revenu : 25 crédits." },
        { id: "ter_generatorium", name: "Generatorium", income: 15, passive: "+1 Réputation", desc: "Revenu : 15 cr. Passif : +1 Réputation tant que contrôlé." },
        { id: "ter_corpse_farm", name: "Corpse farm", income: 25, desc: "Revenu : 25 crédits." },
        { id: "ter_tunnels", name: "Tunnels", income: 20, desc: "Revenu : 20 crédits." },
        { id: "ter_tech_bazaar", name: "Tech bazaar", income: 15, passive: "+1 TP", desc: "Revenu : 15 cr. Passif : +1 TP au Trading Post." },
        { id: "ter_promethium_cache", name: "Promethium cache", income: 15, optionType: "items_suits", optionText: "Option : 3 Combinaisons de protection gratos", desc: "Revenu : 15 cr OU récupérer gratuitement 3 combinaisons de protection dans le Stash." },
        { id: "ter_collapsed_dome", name: "Collapsed dome", income: 20, desc: "Revenu : 20 crédits." },
        { id: "ter_bone_shrine", name: "Bone shrine", income: 25, desc: "Revenu : 25 crédits." },
        { id: "ter_mine_workings", name: "Mine workings", income: 20, optionType: "items_respirators", optionText: "Option : 2 Respirateurs gratos", desc: "Revenu : 20 cr OU récupérer gratuitement 2 respirateurs dans le Stash." },
        { id: "ter_gambling_den", name: "Gambling den", income: 15, passive: "+1 Réputation", desc: "Revenu : 15 cr. Passif : +1 Réputation tant que contrôlé." },
        { id: "ter_synth_still", name: "Synth still", income: 20, desc: "Revenu : 20 crédits." },
        { id: "ter_old_ruins", name: "Old ruins", income: 20, desc: "Revenu : 20 crédits." },
        { id: "ter_fighting_pit", name: "Fighting pit", income: 25, desc: "Revenu : 25 crédits." }
    ],

    // ===== CONDITIONS =====
    conditions: {
        "Fearsome": "Lorsqu'il est pris pour cible d'une attaque de corps à corps, l'attaquant fait un jet de Wil. En cas d'échec, sa WS passe à 6+. Les guerriers fearsome ne sont pas affectés, sauf si la cible est terrifying.",
        "Frénésie": "Le guerrier doit déclarer une charge s'il commence son activation à son M + 6\" d'un ennemi. Il devra charger l'ennemi le plus proche. Ils gagnent +1A.",
        "Haine": "Quand le guerrier engage, charge ou est la cible de ces actions par une figurine haïe, il peut relancer les jets pour toucher ratés.",
        "Blessé": "Le guerrier perd toutes ses compétences jusqu'à ce qu'il récupère un point de vie.",
        "Intoxiqué": "Le guerrier baisse de 1 ses WS et BS, mais augmente son cool de 1.",
        "Terrifying": "A les mêmes avantages qu'un guerrier fearsome. De plus, pour charger ou engager ce guerrier, il faut réussir un test Will. En cas d'échec, l'attaquant reste sur place.",
        "Entoilé": "Le guerrier ne peut plus se déplacer, ni être déplacé et il subit un -1 à tous ses jets pour toucher. À la fin de son activation, un test de force réussi le libère.",
        "Folie": "Quand un guerrier atteint de folie s'active, jeter un dé sur le tableau de folie pour voir comment il va agir. À la fin de son activation, un jet de Will réussi annule la condition folie."
    }
};

// ===== ARMES INTÉGRÉES DONNÉES PAR COMPÉTENCE =====
// Certaines compétences décrivent une "arme intégrée" dans leur texte (ex :
// Headbutt). Cette table associe l'id de la compétence à la définition
// complète de l'arme correspondante (mêmes champs qu'une arme normale de
// db.weapons). La synchronisation automatique (voir ensureInnateFighterSkills
// dans gang-views.js) l'ajoute/la retire de la liste d'armes du combattant en
// fonction de ses compétences actuelles, sans jamais compter dans ses
// emplacements d'arme (voir getWeaponSlotCost) ni dans son coût (0 crédit).
const INNATE_WEAPONS_BY_SKILL = {
    "sk_coup_boule": {
        id: "wpn_headbutt",
        name: "Headbutt",
        profiles: [{ name: "Unique", SR: "E", LR: "-", S: "S+1", AP: "-", L: 1, traits: "Melee, attaque additionnelle (1)" }],
        cost_credits: 0,
        isInnateWeapon: true
    }
};
