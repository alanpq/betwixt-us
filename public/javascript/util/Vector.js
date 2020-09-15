export class Vector {
  /**
   * Create a vector.
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  /**
   * Get the angle of the vector.
   * @return {number} Angle in radians.
   */
  getDirection() {
    return Math.atan2(this.y, this.x);
  };

  /**
   * Set the direction of the vector.
   * @param {number} angle Angle in radians
   */
  setDirection(angle) {
    var magnitude = this.getMagnitude();
    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
  };

  /**
   * Get the magnitude of the vector.
   * @return {number} The magnitude of the vector.
   */
  getMagnitude() {
    // use pythagoras theorem to work out the magnitude of the vector
    return Math.sqrt(this.getSqrMagnitude());
  };

  getSqrMagnitude() {
    return this.x * this.x + this.y * this.y
  }

  /**
   * Set the magnitude of the vector
   * @param {number} magnitude The magnitude of the vector
   */
  setMagnitude(magnitude) {
    var direction = this.getDirection();
    this.x = Math.cos(direction) * magnitude;
    this.y = Math.sin(direction) * magnitude;
  };

  /**
   * Get the dot product between this and another vector.
   * @param {Vector} other Other Vector
   */
  dotProduct(other) {
    return this.x * other.y + this.y * other.x;
  }

  /**
   * Adds another vector to this one, returning a new one.
   * @param {Vector} v2 The second vector
   */
  add(v2) {
    return new Vector(this.x + v2.x, this.y + v2.y);
  };

  /**
   * Adds another vector to this one, modifying this one.
   * @param {Vector} v2 The second vector
   */
  addTo(v2) {
    this.x += v2.x;
    this.y += v2.y;
  };

  /**
   * Subtracts another vector to from one, returning a new one.
   * @param {Vector} v2 The second vector
   */
  subtract(v2) {
    return new Vector(this.x - v2.x, this.y - v2.y);
  };

  /**
   * Subtracts another vector to this one, modifying this one.
   * @param {Vector} v2 The second vector
   */
  subtractFrom(v2) {
    this.x -= v2.x;
    this.y -= v2.y;
  };

  // multiply this vector by a scalar and return a new one
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  };

  // multiply this vector by the scalar
  multiplyBy(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  };

  // scale this vector by scalar and return a new vector
  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  };

  // scale this vector by scalar
  divideBy(scalar) {
    this.x /= scalar;
    this.y /= scalar;
  };

  /**
   * Interpolate between two vectors by a given percentage.
   * @param {Vector} a First Vector
   * @param {Vector} b Second Vector
   * @param {number} t Interpolation Amount
   */
  static lerp(a, b, t) {
    const result = a.add(b.subtract(a).multiply(t));
    return result;
  }



  // Utilities
  copy = function () {
    return new Vector(this.x, this.y);
  };

  toString = function () {
    return 'x: ' + this.x.toFixed(10) + ', y: ' + this.y.toFixed(10);
  };

  toArray = function () {
    return [this.x, this.y];
  };

  toObject = function () {
    return { x: this.x, y: this.y };
  };

  static zero = new Vector(0, 0);
  static one = new Vector(1, 1);
}
// TODO: implement normalize, scale, dot

// Aliases
Vector.prototype.getLength = Vector.prototype.getMagnitude;
Vector.prototype.setLength = Vector.prototype.setMagnitude;

Vector.prototype.getAngle = Vector.prototype.getDirection;
Vector.prototype.setAngle = Vector.prototype.setDirection;