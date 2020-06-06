// blackjack game

const DEALER_STAND_THRESHOLD = 17
const MAX_HAND_VALUE = 21
const DEALER_INITIAL_FACEDOWN = 1
const DEALER_INITIAL_FACEUP = 1
const PLAYER_INITIAL_CARDS = 2

const hitButton: HTMLButtonElement = document.querySelector("#hit-button")
const standButton: HTMLButtonElement = document.querySelector("#stand-button")
const resetButton: HTMLButtonElement = document.querySelector("#reset-button")

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

export class Card {
	faceDown: boolean = false
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
}

export class Game {
	deck: Array<Card>
	playerHand: Array<Card>
	dealerHand: Array<Card>
	gameOver: boolean

	constructor() {
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
		this.shuffleDeck()
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

		this.dealInitialHands()

		this.logHands()
	}

	dealInitialHands() {
		// deal dealer hand
		for (let i = 0; i < DEALER_INITIAL_FACEDOWN; i++) {
			this.dealerHand.push(this.deck.pop())
		}
		for (let i = 0; i < DEALER_INITIAL_FACEUP; i++) {
			this.dealerHand.push(this.deck.pop())
		}

		// deal player hand
		for (let i = 0; i < PLAYER_INITIAL_CARDS; i++) {
			this.playerHand.push(this.deck.pop())
		}
	}
	
	playerHit() {
		if (this.gameOver) {
			return
		}

		const card = this.deck.pop()
		this.playerHand.push(card)

		const playerHandValues = this.getHandValues(this.playerHand)

		this.logHands()

		if ((Math.min(...playerHandValues)) > MAX_HAND_VALUE) {
			// player busted
			console.log('Player bust!')
			console.log('Player loses!')
			this.gameOver = true
		}
	}
	
	playerStand() {
		if (this.gameOver) {
			return
		}

		let dealerHandValues = this.getHandValues(this.dealerHand)
		let dealerHandValue = this.bestValue(dealerHandValues)

		while (dealerHandValue <= DEALER_STAND_THRESHOLD) {
			const card = this.deck.pop()
			this.dealerHand.push(card)

			dealerHandValues = this.getHandValues(this.dealerHand)
			dealerHandValue = this.bestValue(dealerHandValues)
		}

		this.gameOver = true

		const playerHandValues = this.getHandValues(this.playerHand)

		this.logHands()

		if ((Math.min(...dealerHandValues)) > MAX_HAND_VALUE) {
			// dealer busted
			console.log('Dealer bust!')
			console.log('Player wins!')
		} else {
			const dealerValue = this.bestValue(dealerHandValues)
			const playerValue = this.bestValue(playerHandValues)
	
			if (dealerValue > playerValue) {
				console.log('Player loses!')
			} else if (dealerValue < playerValue) {
				console.log('Player wins!')
			} else {
				console.log('Tie!')
			}
		}
	}

	logHands() {
		console.clear()
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
			if (handValue > best && handValue <= MAX_HAND_VALUE) {
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
}

const game = new Game()

hitButton.onclick = function() {
	game.playerHit()
}

standButton.onclick = function() {
	game.playerStand()
}

resetButton.onclick = function() {
	game.resetGame()
}