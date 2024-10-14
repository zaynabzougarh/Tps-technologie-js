import fetch from 'node-fetch';
import readline from 'readline';

let playerHP = 300;
let botHP = 300;

// Création de l'interface readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonction pour obtenir les données d'un Pokémon
async function getPokemonData(pokemonName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des données pour ${pokemonName}`);
    }
    const data = await response.json();
    return data;
}

// Fonction pour obtenir des mouvements aléatoires
function getRandomMoves(moves) {
    const selectedMoves = [];
    while (selectedMoves.length < 5) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        if (!selectedMoves.find(m => m.move.name === move.move.name)) {
            selectedMoves.push(move);
        }
    }
    return selectedMoves;
}

// Fonction pour obtenir les détails d'un mouvement
async function getMoveDetails(moveUrl) {
    const response = await fetch(moveUrl);
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des détails du mouvement.`);
    }
    const data = await response.json();
    return { name: data.name, power: data.power || 0, accuracy: data.accuracy || 100, pp: data.pp || 0 };
}

// Fonction pour afficher les points de vie
function displayHP() {
    console.log(`Points de vie du joueur : ${playerHP}`);
    console.log(`Points de vie du bot : ${botHP}`);
}

// Fonction pour gérer l'attaque
function attack(attacker, defenderHP, move) {
    const randomAccuracy = Math.random() * 100;
    if (move.accuracy && randomAccuracy <= move.accuracy && move.pp > 0) {
        console.log(`${attacker} utilise ${move.name} !`);
        const damage = move.power ? Math.floor(Math.random() * move.power) + 1 : 0;
        console.log(`Attaque réussie ! ${damage} dégâts infligés.`);
        return defenderHP - damage;
    } else {
        console.log(`${attacker} a raté son attaque avec ${move.name} ou n'a plus de PP !`);
        return defenderHP;
    }
}

// Fonction principale pour jouer
async function playGame() {
    const playerPokemon = process.argv[2] || 'pikachu';
    const botPokemon = 'charizard';

    console.log(`Le joueur a choisi ${playerPokemon}`);
    console.log(`Le bot utilise ${botPokemon}`);

    const playerData = await getPokemonData(playerPokemon);
    const botData = await getPokemonData(botPokemon);

    const playerMoves = getRandomMoves(playerData.moves);
    const botMoves = getRandomMoves(botData.moves);

    const playerMoveDetails = await Promise.all(playerMoves.map(m => getMoveDetails(m.move.url)));
    const botMoveDetails = await Promise.all(botMoves.map(m => getMoveDetails(m.move.url)));

    console.log(`Le combat commence !`);
    displayHP();

    while (playerHP > 0 && botHP > 0) {
        console.log("\nMouvements du joueur :");
        playerMoveDetails.forEach((move, index) => {
            console.log(`${index + 1}. ${move.name} (PP: ${move.pp})`); // Affichage uniquement du PP
        });

        // Attente de l'entrée de l'utilisateur
        const moveIndex = await new Promise(resolve => {
            rl.question("Choisissez un mouvement (1-5) : ", answer => {
                resolve(parseInt(answer) - 1);
            });
        });

        const playerMove = playerMoveDetails[moveIndex];
        playerMove.pp--; // Décrémente le PP après utilisation

        botHP = attack(playerPokemon, botHP, playerMove);

        if (botHP <= 0) {
            console.log("Le bot est KO ! Vous avez gagné !");
            break;
        }

        const botMove = botMoveDetails[Math.floor(Math.random() * botMoveDetails.length)];
        playerHP = attack(botPokemon, playerHP, botMove);
        botMove.pp--; // Décrémente le PP du bot après utilisation

        if (playerHP <= 0) {
            console.log("Vous êtes KO ! Le bot a gagné !");
            break;
        }

        displayHP();
    }

    // Fermeture de l'interface readline
    rl.close();
}

// Lancement du jeu
playGame().catch(console.error);
