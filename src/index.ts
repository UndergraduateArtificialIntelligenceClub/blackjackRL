import * as blackjack from './blackjack'
import * as tf from '@tensorflow/tfjs'
import { computer, train, play } from './tfjs'

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

trainButton.onclick = async _ => {
	const title = document.querySelector('title')
	title.innerText = 'BlackjackRL | Training'
	trainButton.classList.add('is-loading')
	playButton.disabled = true
	await train(1024)
	trainButton.classList.remove('is-loading')
	playButton.disabled = false
	title.innerText = 'BlackjackRL'
}

playButton.onclick = _ => {
	play(game)
}
