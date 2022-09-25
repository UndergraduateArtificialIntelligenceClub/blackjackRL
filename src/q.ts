import { time } from '@tensorflow/tfjs';
import { Card, Game, State } from './blackjack'

const alpha = 0.1
const gamma = 1
var q = [];
var cnts = [];

export async function train(runs: number) {
    var game = new Game()
    var dealerCard: number
    var playerHand: number
    var action: number
    var reward: number
    var nextBest: number;

    // Initialize q, cnts arrays
    for (let d = 0; d < 12; d++) {
        q.push([]);
        cnts.push([])
        for (let p = 0; p < 22; p++) {
            q[q.length-1].push([0, 0])
            cnts[cnts.length-1].push([0, 0])
        }
    }

    for (let _ = 0; _ < runs; _++) {
        dealerCard = game.dealerHand[0].value;
        while (!game.gameOver) {
            // pick random action in random direction
            let values = game.getHandValues(game.playerHand)
            values = Array.from(values).filter(num => num <= 21);

            let choice = Math.floor(Math.random() * (values.length * 2))
            
            action = choice % 2
            playerHand = values[Math.floor(choice / 2)]

            let current = q[dealerCard][playerHand][action]
            if (action)
                game.playerHit();
            else
                game.playerStand();
            
            nextBest = 0;
            if (game.gameOver) {
                reward = game.gameResult;
            } else {
                // We know the player can make < 21
                reward = 0;
                let values = game.getHandValues(game.playerHand)

                // Get the best possible q value across all next states
                for (let i = 0; i < values.length; i++) {
                    if (values[i] <= 21) {
                        nextBest = Math.max(nextBest,
                            q[dealerCard][values[i]][0],
                            q[dealerCard][values[i]][1]
                        )
                    }
                }
            }

            // actually perform the q-learning update
            q[dealerCard][playerHand][action] = current + alpha * (
                reward + gamma * nextBest - current
            )

            cnts[dealerCard][playerHand][action]++
        }

        game.resetGame()

        // Estimate ability of bot
        if (_ % 1000 == 0) {
            let totalWins = 0, totalGames = 100
            for (let __ = 0; __ < totalGames; __++) {
                totalWins += play(game)
            }
            
            console.log("Played ", totalGames, "Games, won ", totalWins, "Times")
            game.resetGame()
        }

        // Sleep every so often to not tank browser performance
        if (_ % 20 == 0)
            await new Promise(resolve => setTimeout(resolve, 1));

    }

    for (let d = 1; d <= 11; d++) {
        for (let p = 1; p <= 21; p++) {
            console.log(`Dealer ${d} & Player ${p} => Stand: ${q[d][p][0]} (${cnts[d][p][0]} times)`)
            console.log(`Dealer ${d} & Player ${p} => Hit: ${q[d][p][1]} (${cnts[d][p][1]} times)`)
        }
    }
}

export function play(g: Game) {
    var game = g
    var dealerCard: number
    var action: number
    var nextBest: number;

    dealerCard = game.dealerHand[0].value;
    while (!game.gameOver) {
        let values = game.getHandValues(game.playerHand)

        // Get the best possible q value across all next states
        for (let i = 0; i < values.length; i++) {
            if (values[i] <= 21) {
                if (q[dealerCard][values[i]][0] > nextBest) {
                    nextBest = q[dealerCard][values[i]][0]
                    action = 0
                } else if (q[dealerCard][values[i]][1] > nextBest) {
                    nextBest = q[dealerCard][values[i]][1]
                    action = 1
                }
            }
        }

        if (action)
            game.playerHit();
        else
            game.playerStand();
    }

    return (Number) (game.gameResult == 1)
}
