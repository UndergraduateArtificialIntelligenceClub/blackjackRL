import * as tf from '@tensorflow/tfjs';

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

// Generate some synthetic data for training.
const xs = tf.tensor2d([
		[4, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		[1, 10, 8, 0, 0, 0, 0, 0, 0, 0],
])
const ys = tf.tensor2d([
	[10],
	[-5],
])

// Train the model using the data.
model.fit(xs, ys, {
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
