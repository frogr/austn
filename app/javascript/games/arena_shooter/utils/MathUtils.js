/**
 * Collection of math utility functions for the game
 */
export class MathUtils {
  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Clamped value
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  /**
   * Linear interpolation between a and b
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} - Interpolated value
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} - Angle in radians
   */
  static degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} - Angle in degrees
   */
  static radToDeg(radians) {
    return radians * (180 / Math.PI);
  }
  
  /**
   * Get a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Get a random float between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random float
   */
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  /**
   * Check if a point is inside a rectangle
   * @param {number} x - Point x coordinate
   * @param {number} y - Point y coordinate
   * @param {number} rectX - Rectangle x coordinate
   * @param {number} rectY - Rectangle y coordinate
   * @param {number} rectWidth - Rectangle width
   * @param {number} rectHeight - Rectangle height
   * @returns {boolean} - Whether the point is inside the rectangle
   */
  static pointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
  }
}