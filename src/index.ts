import * as blackjack from './blackjack';

const hitButton: HTMLButtonElement = document.querySelector("#hit-button")
const standButton: HTMLButtonElement = document.querySelector("#stand-button")
const resetButton: HTMLButtonElement = document.querySelector("#reset-button")

const game = new blackjack.Game()

hitButton.onclick = _ => {
	game.playerHit()
}

standButton.onclick = _ => {
	game.playerStand()
}

resetButton.onclick = _ => {
	game.resetGame()
}
