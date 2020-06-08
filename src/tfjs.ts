import * as tf from '@tensorflow/tfjs'
import { Game, State } from './blackjack'
const game = new Game()

// Define a model for linear regression.
const model = tf.sequential()
model.add(tf.layers.dense({
	units: 21,
	activation: 'sigmoid',
	inputShape: [4]
}))
model.add(tf.layers.dense({
	units: 1,
	activation: 'sigmoid'
}))

model.compile({
	loss: tf.losses.meanSquaredError,
	optimizer: tf.train.sgd(0.1)
})

const train = (RUNS: number) => {
	const results = []
	for (let run = 0; run < RUNS; run++) {
		const hitAmount = Math.floor(Math.random() * 3)
		for (let hit = 0; !game.gameOver && hit < hitAmount; hit++) {
			game.playerHit()
		}
		game.playerStand()
		results.push(game.result)
		game.resetGame()
	}

	// Generate some synthetic data for training.
	const xs = []
	const ys = []
	results.forEach(r => {
		xs.push([
			r.state.dealer.value,
			r.state.dealer.ace ? 1 : 0,
			r.state.player.value,
			r.state.player.ace ? 1 : 0
		])
		ys.push([r.reward])
	})

	// Train the model using the data.
	console.log('%c Training...', 'font-size: 16px')
	model.fit(tf.tensor2d(xs), tf.tensor2d(ys), {
		epochs: 10,
		shuffle: true
	}).then((resp) => {
		// Open the browser devtools to see the output
		const loss = resp.history.loss[resp.history.loss.length - 1]
		console.log(`%c Model Loss: ${loss}`, 'color: #6060e0; font-size: 18px;')
		console.table(resp.history.loss)
		// Use the model to do inference on a data point the model hasn't seen before:
		document.querySelector('#train-button').classList.remove('is-loading')
		document.querySelector('#play-button').disabled = false
	})
}

const computer = (input: State) => {
	const prediction = model.predict(tf.tensor2d([[
		input.dealer.value,
		input.dealer.ace ? 1 : 0,
		input.player.value,
		input.player.ace ? 1 : 0
	]]))
	return prediction.arraySync()[0][0]
}

export { computer, train }
