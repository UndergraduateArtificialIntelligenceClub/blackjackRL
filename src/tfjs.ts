import * as tf from '@tensorflow/tfjs'
import { Game } from './blackjack'
const game = new Game()

// Define a model for linear regression.
const model = tf.sequential();
model.add(tf.layers.dense({
	units: 21,
	activation: 'sigmoid',
	inputShape: [10]
}))
model.add(tf.layers.dense({
	units: 1,
	activation: 'sigmoid'
}))

model.compile({
	loss: tf.losses.meanSquaredError,
	optimizer: tf.train.sgd(0.1)
})

// Run 100 games
const RUNS = 100
const results = []
for (let run = 0; run < RUNS; run++) {
	const hitAmount = Math.floor(Math.random() * 3)
	for (let hit = 0; hit < hitAmount; hit++) {
		game.playerHit()
	}
	game.playerStand()
	results.push(game.result)
}

// Generate some synthetic data for training.
console.log(game.state)
const xs = []
const ys = []
results.forEach(r => {
	xs.push(r.state)
	ys.push([r.reward])
})

// Train the model using the data.
model.fit(tf.tensor2d(xs), tf.tensor2d(ys), {
	epochs: 64
	shuffle: true
}).then((resp) => {
	// Open the browser devtools to see the output
	const loss = resp.history.loss[resp.history.loss.length - 1]
	console.log(`%c Model Loss: ${loss}`, 'color: #6060e0; font-size: 18px;')
	console.table(resp.history.loss)
	// Use the model to do inference on a data point the model hasn't seen before:
	model.predict(tf.tensor2d([[10,2,3,4,0,0,0,0,0,0]])).print()
});

const computer = (input: Array<number>) => {
	return model.predict(tf.tensor2d([input]))
}

export { computer }
