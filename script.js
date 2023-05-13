class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
}

class Deck {
    constructor() {
        this.deck = [];
        this.usedCards = 0;

        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        for (let suit of suits) {
            for (let value of values) {
                this.deck.push(new Card(suit, value));
            }
        }

        // Double the deck
        this.deck = this.deck.concat(this.deck);
        this.shuffle();
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        this.usedCards = 0;
    }

    deal() {
        if (this.usedCards / this.deck.length > 0.75) {
            this.shuffle();
        }
        return this.deck[this.usedCards++];
    }
}


const playerHandElement = document.getElementById('player-hand');
const dealerHandElement = document.getElementById('dealer-hand');
const hitButton = document.getElementById('hit-btn');
const standButton = document.getElementById('stand-btn');
const doubleButton = document.getElementById('double-btn');
const messageElement = document.getElementById('message');
const gameResultElement = document.getElementById('game-result');

let game;

hitButton.addEventListener('click', handleHit);
standButton.addEventListener('click', handleStand);
doubleButton.addEventListener('click', handleDoubleDown);

function handleHit() {
    game.playerDecision('h');
    updateUI();
}

function handleStand() {
    game.playerDecision('s');
    updateUI();
    
}

function handleDoubleDown() {
    game.playerDecision('d');
    updateUI();
   
}

// UI update functions
function updateUI() {
    clearUI();
    updatePlayerHand();
    updateDealerHand();
    updateMessage();
}

function clearUI() {
    playerHandElement.innerHTML = '';
    dealerHandElement.innerHTML = '';
    messageElement.textContent = '';
}

function updatePlayerHand() {
    const playerHand = game.playerHand.map(card => `${card.value} of ${card.suit}`).join(', ');
    playerHandElement.textContent = `Player Hand: ${playerHand}`;
}

function updateDealerHand() {
    const visibleCards = game.dealerHand.slice(0, 1).map(card => `${card.value} of ${card.suit}`).join(', ');
    dealerHandElement.textContent = `Dealer Hand: ${visibleCards} (hidden)`;
  }


function updateMessage() {
    messageElement.textContent = `Correct Decisions: ${game.correctDecisions} | Mistakes: ${game.mistakes}`;
}
function checkGameResult() {
    if (game.playerScore > 21) {
        messageElement.textContent = 'Busted! You lose.';
        disableButtons();
    } else if (game.playerScore === 21) {
        messageElement.textContent = 'Blackjack! You win!';
        disableButtons();
    } else if (game.dealerScore > 21) {
        messageElement.textContent = 'Dealer busts! You win!';
        disableButtons();
    } else if (game.playerScore < game.dealerScore) {
        messageElement.textContent = 'Dealer wins!';
        disableButtons();
    } else if (game.playerScore > game.dealerScore) {
        messageElement.textContent = 'You win!';
        disableButtons();
    } else {
        messageElement.textContent = 'Push! It\'s a tie.';
        disableButtons();
    }
}

function disableButtons() {
    hitButton.disabled = true;
    standButton.disabled = true;
    doubleButton.disabled = true;
}

// Game initialization
function initializeGame() {
    game = new Game();
    game.startNewGame();
    updateUI();
}

// Initialize the game when the page loads
window.addEventListener('load', initializeGame);

class Game {
    constructor() {
        this.deck = new Deck();
        this.playerHand = [];
        this.dealerHand = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.correctDecisions = 0;
        this.mistakes = 0;
    }
revealDealerHand() {
        const dealerHand = game.dealerHand.map(card => `${card.value} of ${card.suit}`).join(', ');
        dealerHandElement.textContent = `Dealer Hand: ${dealerHand}`;
      }
    evaluateDecision(decision) {
        // Basic strategy decision
        this.playerScore = this.calculateScore(this.playerHand);

        let strategyDecision = 'h'; // Default to hit
        let dealerCardValue = this.getNumericCardValue(this.dealerHand[0].value);
    
        // Check if the player's hand is soft (contains an Ace counted as 11)
        let acesAsOne = this.playerHand.filter(card => card.value === 'A').length;
        let handWithoutAces = this.playerScore - acesAsOne * 11;
        let isSoft = acesAsOne > 0 && handWithoutAces <= 10;
        if (isSoft) {
            // Basic strategy for soft hands
            if (this.playerScore >= 19) {
                strategyDecision = 's'; // stand
            } else if (this.playerScore === 18) {
                if (dealerCardValue >= 2 && dealerCardValue <= 8) {
                    strategyDecision = 's'; // stand
                }
            }
        } else {
            // Basic strategy for hard hands
            if (this.playerScore >= 17) {
                strategyDecision = 's'; // stand
                console.log('should stay');
            } else if (this.playerScore >= 13 && this.playerScore <= 16) {
                if (dealerCardValue >= 2 && dealerCardValue <= 6) {
                    strategyDecision = 's'; // stand
                    console.log('should stay');
                }
            } else if (this.playerScore === 12) {
                if (dealerCardValue >= 4 && dealerCardValue <= 6) {
                    strategyDecision = 's'; // stand
                    console.log('should stay');
                }
            }
    
            // Basic strategy for doubling down
            if (this.playerHand.length === 2) {
                if (this.playerScore === 11) {
                    strategyDecision = 'd'; // double down
                } else if (this.playerScore === 10 && dealerCardValue != 10 && dealerCardValue != 11) {
                    strategyDecision = 'd'; // double down
                } else if (this.playerScore === 9 && dealerCardValue >= 3 && dealerCardValue <= 6) {
                    strategyDecision = 'd'; // double down
                }
            }
        }
        if (decision === strategyDecision.charAt(0)) {
            this.correctDecisions++;
            console.log('Correct decision!');
        } else {
            this.mistakes++;
            console.log('Incorrect decision.');
        }
    }
getNumericCardValue(value) {
    if (value === 'A') return 11;
    else if (value === 'K' || value === 'Q' || value === 'J') return 10;
    else return parseInt(value);
}

    startNewGame() {
        this.playerHand = [this.deck.deal(), this.deck.deal()];
        this.dealerHand = [this.deck.deal(), this.deck.deal()];
    }

    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
            if (card.value === 'A') {
                score += 11;
                aces++;
            } else if ('JQK'.includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }
    playerDecision(decision) {
        // Assume the decision is either 'h' (hit), 's' (stand), or 'd' (double down)
        if (decision === 'h') {
            this.evaluateDecision(decision);
    
            this.playerHand.push(this.deck.deal());
            this.playerScore = this.calculateScore(this.playerHand);
            if (this.playerScore > 21) {
                console.log('You busted!');
                checkGameResult(); // You could check the game result here
                disableButtons(); // And disable the buttons
                return;
            } else if (this.playerScore === 21) {
                console.log('Blackjack!');
            }
            updateUI(); // update UI after player's hit
            
        } else if (decision === 's') {
            gameResultElement.textContent += `Dealer Hand: ${game.dealerHand.map(card => `${card.value} of ${card.suit}`).join(', ')}`;

            this.evaluateDecision(decision);
            this.dealerPlay();
            updateUI(); // update UI after dealer's turn
         
        } else if (decision === 'd' && this.playerHand.length === 2) {
            this.evaluateDecision(decision);
    
            this.playerHand.push(this.deck.deal());
            this.playerScore = this.calculateScore(this.playerHand);
            console.log('You chose to double down!');
            this.dealerPlay();
            updateUI(); // update UI after dealer's turn
           
        }
    }

    
    dealerPlay() {

    
        this.revealDealerHand();


        this.dealerScore = this.calculateScore(this.dealerHand);

        gameResultElement.textContent += `Dealer's score: ${this.dealerScore}`;

        while (this.dealerScore < 17) {
            this.dealerHand.push(this.deck.deal());
            this.dealerScore = this.calculateScore(this.dealerHand);
           gameResultElement.textContent += `Dealer hits: ${this.dealerHand[this.dealerHand.length - 1].value}`;

        }
        checkGameResult();
    
        if (this.dealerScore > 21) {
            console.log('Dealer busted! You win!');
            gameResultElement.textContent += 'Dealer busted! You win!';
        } else if (this.dealerScore > this.playerScore) {
            console.log('Dealer wins!');
            gameResultElement.textContent += 'Dealer wins!';

        } 
        else if (this.dealerScore < this.playerScore) {
            console.log('You win!');
            gameResultElement.textContent += 'You win!';

        } 
        
        
        else {
            console.log('push!');
        }
    }
    
    async playGame() {
        this.startNewGame();
        while (true) {
            this.playerScore = this.calculateScore(this.playerHand);
            this.dealerScore = this.calculateScore(this.dealerHand);
            console.log(`Player hand: ${this.playerHand.map(card => card.value).join(', ')}`);
            console.log(`Player score: ${this.playerScore}`);
            console.log(`Dealer's first card: ${this.dealerHand[0].value}`);
            if (this.playerScore > 21) {
                console.log('Busted! You lose.');
                break;
            } else if (this.playerScore === 21) {
                console.log('Blackjack! You win!');
                break;
            } else {
                let decision = await this.prompt('Do you want to (h)it, (s)tand, or (d)ouble down? ');
                if (decision === 'h') {
                    this.evaluateDecision(decision);
                    this.playerHand.push(this.deck.deal());
                 
                } else if (decision === 's') {
                    this.evaluateDecision(decision);
                    this.dealerPlay();
                 
                    break;
                } else if (decision === 'd' && this.playerHand.length === 2) {
                    this.evaluateDecision(decision);
                    this.playerHand.push(this.deck.deal());
                    console.log('You chose to double down!');
                    this.dealerPlay();
                    break;
                }
            }
        }
        console.log(`Correct decisions: ${this.correctDecisions}`);
        console.log(`Mistakes: ${this.mistakes}`);
    }

    prompt(question) {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise(resolve => readline.question(question, ans => {
            readline.close();
            resolve(ans);
        }))
    }

}

(async () => {
    let game = new Game();
    await game.playGame();
})();