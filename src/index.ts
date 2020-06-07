import * as blackjack from './blackjack'
import * as tf from '@tensorflow/tfjs'
import { computer, train } from './tfjs'

const trainButton: HTMLButtonElement = document.querySelector('#train-button')
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
	train(1000)
}
