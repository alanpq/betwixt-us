export const gameState = {
  _score: 0,
  set score(newScore) {
    this._score = newScore;
    // uiDrawScore();
    // scoreUIDraw()
    console.log(this._score)
  },
  get score() {
    return this._score;
  },

  updateScore(change) {
    this._score += change
    // scoreUIDraw()
  },

  killCounter: 1,

}

export const baseVisibility = 8;

export const gameOptions = {
  max_score: 100,
  crew_visibility: 1,
  kill_range: 1.75,
  kill_counter: 1,
  player_speed: 5,
}