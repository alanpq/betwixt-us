import GameSettings from "./GameSettings";
import IPlayer from "./game/IPlayer";

const generateRoomCode = () => {
  return 'AAAA'; // FIXME: make code generation
}

export default class Room {
  code: string;

  settings: GameSettings;
  players: { [id: string]: IPlayer };

  constructor() {
    this.code = generateRoomCode();
    this.players = {};
  }
}