// blackjack game
import { EventEmitter } from 'events'
import diamondIMG from './assets/diamond.svg'
import clubIMG from './assets/club.svg'
import spadeIMG from './assets/spade.svg'
import heartIMG from './assets/heart.svg'

type Suit = 'diamond' | 'club' | 'spade' | 'heart'

export enum Rank {
	two = 2,
	three,
	four,
	five,
	six,
	seven,
	eight,
	nine,
	ten,
	ace,
	jack,
	queen,
	king
}

export interface State {
	dealer: {
		value: number,
		ace: boolean
	},
	player: {
		value: number,
		ace: boolean
	}
}

export class Card {
	value: number
	repr: string

	constructor(public suit: Suit, public rank: Rank) {
		if (this.rank < Rank.ace) {
			this.value = this.rank
			this.repr = this.rank.toString()
		} else if (this.rank == Rank.jack) {
			this.value = 10
			this.repr = 'J'
		} else if (this.rank == Rank.queen) {
			this.value = 10
			this.repr = 'Q'
		} else if (this.rank == Rank.king) {
			this.value = 10
			this.repr = 'K'
		} else if (this.rank == Rank.ace) {
			// this is kinda weird, since aces can be 1 or 11. currently handling that with getHandValues()
			this.value = 1
			this.repr = 'A'
		}
	}

	render(show = true) {
		let card = document.createElement('div')
		card.classList.add('blackjack-card')
		if (show) {
			card.classList.add(`suit-${this.suit}`)
			let img: NodeModule
			switch(this.suit) {
				case 'diamond':
					img = diamondIMG
					break
				case 'club':
					img = clubIMG
					break
				case 'spade':
					img = spadeIMG
					break
				case 'heart':
					img = heartIMG
					break
			}
			card.innerHTML = `<span>${this.repr}</span><img src="${img}"/>`
		} else {
			card.classList.add('hide')
		}
		return card
	}
}

export class Game {
	DEALER_STAND_THRESHOLD = 17
	MAX_HAND_VALUE = 21
	DEALER_INITIAL_FACEDOWN = 1
	DEALER_INITIAL_FACEUP = 1
	PLAYER_INITIAL_CARDS = 2

	events: EventEmitter
	deck: Array<Card>
	playerHand: Array<Card>
	dealerHand: Array<Card>
	gameOver: boolean
	gameResult: number

	playerWins = 0
	playerLosses = 0
	playerDraws = 0

	constructor() {
		this.events = new EventEmitter()
		this.events.on('player-dealt', _ => {
			let ph = document.querySelector('#blackjack-player')
			ph.innerHTML = ''
			for (const card of this.playerHand) {
				ph.append(card.render())
			}
		})
		this.events.on('dealer-dealt', _ => {
			let dh = document.querySelector('#blackjack-dealer')
			let showCard = true
			dh.innerHTML = ''
			for (const card of this.dealerHand) {
				dh.append(card.render(showCard))
				if (!this.gameOver && showCard) showCard = false
			}
		})
		const title = document.querySelector('#blackjack-state')
		const stats = document.querySelector('#blackjack-stats')
		this.events.on('player-won' _ => {
			title.innerText = 'You won! 😁'
			stats.querySelector('#w').innerText = this.playerWins
			this.gameResult = 1
		})
		this.events.on('player-lost' _ => {
			title.innerText = 'You lost! 🙁'
			stats.querySelector('#l').innerText = this.playerLosses
			this.events.emit('dealer-dealt')
			this.gameResult = -1
		})
		this.events.on('player-tied' _ => {
			title.innerText = 'You tied! 😶'
			stats.querySelector('#d').innerText = this.playerDraws
			this.gameResult = .5
		})
		this.events.on('game-finished', _ => {
			for (const button of document.querySelectorAll('button.is-light')) {
				button.disabled = true
			}
			document.querySelector('#play-button').disabled = true
			let total = this.playerWins + this.playerLosses + this.playerDraws + 1
			stats.querySelector('#t').innerText = total
		})
		this.resetGame()
	}

	newDeck(): void {
		this.deck = []
		const suits: Array<Suit> = ['diamond', 'club', 'spade', 'heart']
		for (const suit of suits) {
			for (let rank = Rank.two; rank <= Rank.king; rank++) {
				this.deck.push(new Card(suit, rank))
			}
		}
	}

	shuffleDeck(): void {
		let i, j, temp
		for (i = this.deck.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1))
			temp = this.deck[i]
			this.deck[i] = this.deck[j]
			this.deck[j] = temp
		}
	}

	resetGame() {
		this.gameOver = false
		this.newDeck()
		this.shuffleDeck()
		this.playerHand = []
		this.dealerHand = []
		this.gameResult = 0

		this.dealInitialHands()

		if (window.DEBUG) this.logHands()

		for (const button of document.querySelectorAll('button.is-light')) {
			button.disabled = false
		}
		document.querySelector('#play-button').disabled = false
		document.querySelector('#blackjack-state').innerText = 'Playing 🃏'
	}

	dealInitialHands() {
		// deal dealer hand
		for (let i = 0; i < this.DEALER_INITIAL_FACEDOWN; i++) {
			this.dealerHand.push(this.deck.pop())
		}
		for (let i = 0; i < this.DEALER_INITIAL_FACEUP; i++) {
			this.dealerHand.push(this.deck.pop())
		}

		// deal player hand
		for (let i = 0; i < this.PLAYER_INITIAL_CARDS; i++) {
			this.playerHand.push(this.deck.pop())
		}
		this.events.emit('player-dealt')
		this.events.emit('dealer-dealt')
	}

	playerHit() {
		if (this.gameOver) {
			return
		}

		const card = this.deck.pop()
		this.playerHand.push(card)

		const playerHandValues = this.getHandValues(this.playerHand)

		if (window.DEBUG) this.logHands()

		if ((Math.min(...playerHandValues)) > this.MAX_HAND_VALUE) {
			// player busted
			if (window.DEBUG) {
				console.log('Player bust!')
				console.log('Player loses!')
			}
			this.gameOver = true
			this.events.emit('game-finished')
			this.playerLosses++
			this.events.emit('player-lost')
		}
		this.events.emit('player-dealt')
	}

	playerStand() {
		if (this.gameOver) {
			return
		}

		let dealerHandValues = this.getHandValues(this.dealerHand)
		let dealerHandValue = this.bestValue(dealerHandValues)

		this.gameOver = true
		this.events.emit('game-finished')

		while (dealerHandValue <= this.DEALER_STAND_THRESHOLD) {
			const card = this.deck.pop()
			this.dealerHand.push(card)

			dealerHandValues = this.getHandValues(this.dealerHand)
			dealerHandValue = this.bestValue(dealerHandValues)
		}
		this.events.emit('dealer-dealt')

		const playerHandValues = this.getHandValues(this.playerHand)

		if (window.DEBUG) this.logHands()

		if ((Math.min(...dealerHandValues)) > this.MAX_HAND_VALUE) {
			// dealer busted
			if (window.DEBUG) {
				console.log('Dealer bust!')
				console.log('Player wins!')
			}
			this.playerWins++
			this.events.emit('player-won')
		} else {
			const dealerValue = this.bestValue(dealerHandValues)
			const playerValue = this.bestValue(playerHandValues)

			if (dealerValue > playerValue) {
				if (window.DEBUG) console.log('Player loses!')
				this.playerLosses++
				this.events.emit('player-lost')
			} else if (dealerValue < playerValue) {
				if (window.DEBUG) console.log('Player wins!')
				this.playerWins++
				this.events.emit('player-won')
			} else {
				if (window.DEBUG) console.log('Draw!')
				this.playerDraws++
				this.events.emit('player-tied')
			}
		}
	}

	logHands() {
		console.clear()
		console.log('Game state: ' + this.gameOver)
		console.log(`${this.playerWins}W, ${this.playerLosses}L, ${this.playerDraws}D`)
		console.log(`Dealer hand:\n${this.dealerHand.map(x => x.repr)}`)
		console.log(`Dealer hand values:\n${this.getHandValues(this.dealerHand)}`)
		console.log()
		console.log(`Player hand:\n${this.playerHand.map(x => x.repr)}`)
		console.log(`Player hand values:\n${this.getHandValues(this.playerHand)}`)
		console.log()
	}

	bestValue(handValues: Array<number>): number {
		let best = Math.min(...handValues)
		for (const handValue of handValues) {
			if (handValue > best && handValue <= this.MAX_HAND_VALUE) {
				best = handValue
			}
		}
		return best
	}

	// return all possible values of the hand (aces being 1 or 11)
	getHandValues(hand: Array<Card>): Array<number> {
		let handValues: Array<number> = []

		let flatValues = 0
		let numAces = 0

		for (const card of hand) {
			if (card.rank == Rank.ace) {
				numAces += 1
			} else {
				flatValues += card.value
			}
		}

		handValues.push(flatValues)

		for (let i = 0; i < numAces; i++) {
			let ace1 = handValues.map(x => x + 1)
			let ace11 = handValues.map(x => x + 11)
			handValues = ace1.concat(ace11)
		}

		return handValues
	}

	dealCard(amount = 1): Array<Card> {
		const cards = []
		for (let i = 0; i < amount; i++) {
			cards.push(this.deck.pop())
		}
		return cards
	}

	get state(): State {
		const state: State = { dealer: {}, player: {} }
		if (this.dealerHand[0].rank != Rank.ace) {
			state.dealer.value = this.dealerHand[0].value
			state.dealer.ace = false
		} else {
			state.dealer.value = 0
			state.dealer.ace = true
		}
		state.player.value = 0
		state.player.ace = false
		let playerCards
		if (this.gameOver) {
			playerCards = this.playerHand.slice(0, this.playerHand.length - 1)
		} else {
			playerCards = this.playerHand
		}
		for (const playerCard of playerCards) {
			if (playerCard.rank != Rank.ace) {
				state.player.value += playerCard.value
			} else {
				if (state.player.ace) {
					state.player.value += playerCard.value
				}
				state.player.ace = true
			}
		}
		return state
	}

	get result(): {state: State, reward: number} {
		const state = this.state
		const reward = this.gameResult
		return { state, reward }
	}
}
