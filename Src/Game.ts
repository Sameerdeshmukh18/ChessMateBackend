import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./Messages";
import { WebSocket as ws } from "ws";

export class Game{
    
    public player1: ws;
    public player2: ws;
    private board: Chess;
    private startTime: Date;
    private moves: String[];
    private moveCount: number = 0;

    constructor(player1: ws, player2: ws){
        this.player1=player1;
        this.player2=player2;
        this.board = new Chess();
        this.moves= [];
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            color: "White"
        }))
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            color: "Black"
        }))

    }

    makeMove(socket:ws, move: {
        from: string;
        to: string;
    }){
        if(this.moveCount % 2===0 && socket!==this.player1){
            console.log("not player 2 turn")
            return;
        }
        if(this.moveCount % 2===1 && socket!==this.player2){
            
            console.log("not player 1 turn")
            return;
        }
        try {
            this.board.move(move);
        } catch (error) {
            return     
        }

        if(this.moveCount%2===0){
            console.log("player 1 moved, player 2 turn")
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
            // this.player1.send(JSON.stringify({
            //     type: MOVE,
            //     payload: move
            // }));
        }
        if(this.moveCount%2===1){
            console.log("player 2 moved, player 1 turn")
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
            // this.player2.send(JSON.stringify({
            //     type: MOVE,
            //     payload: move
            // }))

        }
        this.moveCount++;
        if(this.board.isGameOver()){
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn()==='w'?"Black":"White"
                }
            }));
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn()==='w'?"Black":"White"
                }
            }))
        }
        

    }
    
}