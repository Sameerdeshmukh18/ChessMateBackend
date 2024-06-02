import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./Messages";
import { WebSocket as ws } from "ws";


export class GameManager{
    private games: Game[];
    private pendingUser:ws | null;
    private users: ws[];
    constructor(){
        this.games=[];
        this.pendingUser = null;
        this.users = [];

    }

    addUser(socket: ws){
        this.users.push(socket);
        this.addHandler(socket);

    }
    removeUser(socket: ws){
        this.users= this.users.filter(user=>user!==socket);
        // stop the game as user has left already
    }

    private addHandler(socket: ws){
        socket.on("message",(data)=>{
            const message = JSON.parse(data.toString());
            if(message.type===INIT_GAME){
                if(this.pendingUser){
                    // start a game
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }else{
                    this.pendingUser = socket;

                }
                
            }
            if(message.type === MOVE){
                const game = this.games.find(game=> game.player1===socket || game.player2===socket);
                if(game){
                    game.makeMove(socket, message.move);
                }

            }
        })

    }

}