// blackjack game

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
	constructor(public suit: Suit, public rank: Rank) { }

	get value(): number {
		if (this.rank <= Rank.ace) return this.rank
		else return 10
	}
}

export class Game {
	deck: Array<Card>

	newDeck(): void {
		this.deck = []
		const suits = ['diamond', 'club', 'spade', 'heart']
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

	dealCard(amount = 1): Array<Card> {
		const cards = []
		for (let i = 0; i < amount; i++) {
			cards.push(this.deck.pop())
		}
		return cards
	}
}
