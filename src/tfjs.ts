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
		[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		[4, 1, 2, 1, 2, 3, 1, 5, 1, 2],
], [2, 10])
const ys = tf.tensor2d([
	[1000],
	[1],
], [2, 1])

// Train the model using the data.
model.fit(xs, ys, {epochs: 4}).then((resp) => {
	// Use the model to do inference on a data point the model hasn't seen before:
	//model.predict(tf.tensor2d([1, 2, 3, 4, 5, 6, 7, 8, 9, 0], [1, 10])).print()
	// Open the browser devtools to see the output
	console.log('%c Training History:', 'color: #6060e0; font-size: 18px;')
	console.table(resp.history)
	model.predict(tf.tensor2d([1,2,3,4,5,6,7,8,9,0],[1, 10])).print()
});

const computer = (input: Array<any>) => {
	return model.predict(tf.tensor2d(input, [1, 10]))
}

export { computer }
