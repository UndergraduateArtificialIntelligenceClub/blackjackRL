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
	const title = document.querySelector('title')
	title.innerText = 'BlackjackRL | Training'
	trainButton.classList.add('is-loading')
	playButton.disabled = true
	train(1024, 32)
}

playButton.onclick = _ => {
	const threshold = .5
	while (!game.gameOver) {
		const prediction = 1 - computer(game.state)
		console.log(`I'm ${ prediction * 100 }% sure I'll win if I stand.`)
		console.info(prediction)
		if (prediction < threshold) game.playerStand()
		else game.playerHit()
	}
	if (!game.gameOver) {
		console.table(game.state)
		console.info(game.result.reward)
	}
}
