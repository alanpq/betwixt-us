import GameSettings from "./GameSettings";
import IPlayer from "./game/IPlayer";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

const generateRoomCode = () => {
  let string = ""; // TODO: improve code generation
  for (let i = 0; i < 4; i++) {
    string += alphabet[Math.floor(Math.random() * (alphabet.length - 1))]
  }
  return string;
}

export default class Room {
  code: string;

  settings: GameSettings;
  players: { [id: string]: IPlayer };

  host: string;

  constructor() {
    this.code = generateRoomCode();
    this.players = {};
  }
}