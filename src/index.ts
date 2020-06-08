import * as blackjack from './blackjack'
import * as tf from '@tensorflow/tfjs'
import { computer, train } from './tfjs'

const trainButton: HTMLButtonElement = document.querySelector('#train-button')
const playButton: HTMLButtonElement = document.querySelector('#play-button')
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

trainButton.onclick = _ => {
	trainButton.classList.add('is-loading')
	playButton.disabled = true
	train(1024)
}

playButton.onclick = _ => {
	const threshold = .9
	while (!game.gameOver) {
		const prediction = 1 - computer(game.state)
		console.log(`I'm ${ Math.round(prediction * 100) }% sure I should hit`)
		console.info(prediction)
		if (prediction < threshold) game.playerStand()
		else game.playerHit()
	}
}
