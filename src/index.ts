import * as blackjack from './blackjack';

const hitButton: HTMLButtonElement = document.querySelector("#hit-button")
const standButton: HTMLButtonElement = document.querySelector("#stand-button")
const resetButton: HTMLButtonElement = document.querySelector("#reset-button")

const game = new blackjack.Game()

hitButton.onclick = function() {
	game.playerHit()
}

standButton.onclick = function() {
	game.playerStand()
}

resetButton.onclick = function() {
	game.resetGame()
}
