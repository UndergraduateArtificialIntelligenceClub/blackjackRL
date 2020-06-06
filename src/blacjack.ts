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
}
