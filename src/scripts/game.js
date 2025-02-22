// src/scripts/game.js
import Grid from './grid.js';
import Player from './player.js';
import symbols from './symbol_list.js';  // Import the symbols

const GameState = {
    WAITING: 'waiting',
    SPINNING: 'spinning',
    SCORING: 'scoring',
    RESULT: 'result',
    ADD_SYMBOL: 'add_symbol',
    GAME_OVER: 'game_over' // Add a game over state
};

class Game {
    constructor(player) {
        this.grid = new Grid(4, 5, player);
        this.player = player;
        this.state = GameState.WAITING;
        this.rentDue = 50;  // Initial rent
        this.rentIncrease = 25; // Rent increases by this much each time
        this.spinsRemaining = 15; // Number of spins before rent is due
        this.currentSpin = 0;
    }

    start() {
        console.log('Game started');
        this.setState(GameState.WAITING);
        this.grid.initializeReels();
        this.updateUI(); // Add a method to update the entire UI
    }

    spin() {
        if (this.state !== GameState.WAITING) return;
    
        console.log('Spinning...');
        this.setState(GameState.SPINNING);
        this.grid.clearGrid();
        this.currentSpin++;
        this.grid.placeSymbols(); //place symbols before the timeout
    
        // Trigger the spinReels animation
        this.grid.spinReels().then(() => { // Await completion of animation
            this.grid.calculateScores();
            this.grid.render(); // Update the grid display
            this.grid.updateReels(); //update the UI
            this.setState(GameState.SCORING);
            setTimeout(() => {
                this.showResult();
            }, 1000);
        });
    
    }


    showResult() {
        console.log('Showing result...');
        this.setState(GameState.RESULT);
        this.updateUI(); // Update money display
        this.spinsRemaining--;


         if (this.spinsRemaining <= 0) {
                this.checkRentPayment();
            } else {
                // Go to add symbol phase
                setTimeout(() => {
                  this.promptNewSymbol();
                }, 1000);
            }
    }

    promptNewSymbol() {
        console.log('Adding new symbol...');
        this.setState(GameState.ADD_SYMBOL);

        // Display symbol choices to the player.  This is *crucial*.
        this.displaySymbolChoices();

        // Player.addSymbol() will now be called *after* the player makes a choice.
    }

    waitForNextRound() {
        console.log('Waiting for next round...');
        this.setState(GameState.WAITING);
        this.updateUI();
    }


    setState(newState) {
        console.log(`Transitioning to ${newState}`);
        this.state = newState;
    }

    updateUI() {
        this.player.updateMoneyDisplay();
        document.getElementById('rentDisplay').textContent = `Rent Due: ${this.rentDue}`;
        document.getElementById('spinsRemainingDisplay').textContent = `Spins Remaining: ${this.spinsRemaining}`;
    }

    checkRentPayment() {
        if (this.player.wallet >= this.rentDue) {
            this.player.removeMoney(this.rentDue);
            this.rentDue += this.rentIncrease;
            this.spinsRemaining = 15; // Reset spins
            this.updateUI();
            this.promptNewSymbol(); // Continue the game
              // Add "rent paid" animation
              const rentDisplay = document.getElementById('rentDisplay');
              rentDisplay.classList.add('rent-paid');
              setTimeout(() => {
                  rentDisplay.classList.remove('rent-paid');
              }, 2000);
        } else {
            this.setState(GameState.GAME_OVER);
            alert("Game Over! You couldn't pay the rent.");
            // You could also offer a "restart" button here.
             // Disable spin button
             document.getElementById('spinButton').disabled = true;
        }
    }

    displaySymbolChoices() {
        const symbolChoicesContainer = document.getElementById('symbolChoices');
        const popupBackground = document.createElement('div');
        popupBackground.classList.add('popup-background');
        document.body.appendChild(popupBackground);
        popupBackground.style.display = 'block';
    
        symbolChoicesContainer.innerHTML = ''; // Clear previous choices
    
        // Create a title
        const title = document.createElement('h2');
        title.textContent = "Choose a Symbol";
        symbolChoicesContainer.appendChild(title);
    
        // Create a grid layout container
        const choiceContainer = document.createElement('div');
        choiceContainer.classList.add('symbol-choice-container');
        symbolChoicesContainer.appendChild(choiceContainer);
    
        // Get 3 random symbols
        const availableSymbols = Object.keys(symbols);
        const chosenSymbols = [];
        for (let i = 0; i < 3; i++) {
            let randomIndex = Math.floor(Math.random() * availableSymbols.length);
            chosenSymbols.push(availableSymbols[randomIndex]);
            availableSymbols.splice(randomIndex, 1);  // Remove to avoid duplicates
        }
    
        chosenSymbols.forEach(symbolAlias => {
            const symbol = symbols[symbolAlias];
            const button = document.createElement('div');
    
            // Apply styles
            button.classList.add('symbol-choice');
            button.innerHTML = `
                <div class="symbol-icon">${symbol.unicode}</div>
                <div class="symbol-name"><b>${symbol.alias}</b></div>
                <div class="symbol-description">${symbol.tooltip}</div>
            `;
    
            button.onclick = () => {
                this.player.addSymbol(symbolAlias);
                symbolChoicesContainer.innerHTML = ''; // Clear choices after selection
                symbolChoicesContainer.style.display = 'none';
                popupBackground.style.display = 'none'; // Hide background blur
                document.body.removeChild(popupBackground);
                this.waitForNextRound();
            };
    
            choiceContainer.appendChild(button);
        });
    
        // Show the container
        symbolChoicesContainer.style.display = 'flex';
    }
    
    
}

export default Game;