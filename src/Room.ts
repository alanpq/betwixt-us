import GameSettings from "./GameSettings";

const generateRoomCode = () => {
  return 'AAAA'; // FIXME: make code generation
}

export default class Room {
  code: string;

  settings: GameSettings;

  constructor() {
    this.code = generateRoomCode();
  }
}