import * as tf from '@tensorflow/tfjs'
import { Game, State } from './blackjack'

// Define a model for linear regression.
const model = tf.sequential()
model.add(tf.layers.dense({
	units: 6,
	activation: 'relu',
	inputShape: [4]
}))
model.add(tf.layers.dense({
	units: 3,
	activation: 'tanh'
}))
model.add(tf.layers.dense({
	units: 1,
	activation: 'relu'
}))

model.compile({
	loss: tf.losses.meanSquaredError,
	optimizer: tf.train.sgd(0.2)
})

export async function train(runs: number) {
	const game = new Game()
	for (let run = 0; run < runs; run++) {
		const hitAmount = Math.floor(Math.random() * 3)
		play(game)
		const result = game.result
		game.resetGame()

		// Generate some synthetic data from game
		const xs = [[
			result.state.dealer.value,
			result.state.dealer.ace ? 1 : 0,
			result.state.player.value,
			result.state.player.ace ? 1 : 0
		]]
		const ys = [[result.reward]]

		// Train the model using the data.
		console.log('%c Training...', 'font-size: 16px')
		const resp = await model.fit(tf.tensor2d(xs), tf.tensor2d(ys))
		// Open the browser devtools to see the output
		const loss = resp.history.loss[resp.history.loss.length - 1]
		console.log(`%c Model Loss: ${loss}`, 'color: #6060e0; font-size: 18px;')
		console.table(resp.history.loss)
		// Use the model to do inference on a data point the model hasn't seen before:
	}
}

export function computer(input: State) {
	const prediction = model.predict(tf.tensor2d([[
		input.dealer.value,
		input.dealer.ace ? 1 : 0,
		input.player.value,
		input.player.ace ? 1 : 0
	]]))
	return prediction.flatten().arraySync()[0]
}

export function play(g: Game) {
	const threshold = .5
	while (!g.gameOver) {
		const prediction = computer(g.state)
		console.info(prediction)
		if (prediction > threshold) g.playerStand()
		else g.playerHit()
	}
	if (!g.gameOver) {
		console.table(g.state)
		console.info(g.result.reward)
	}
}
