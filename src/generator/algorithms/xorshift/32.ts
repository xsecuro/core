import { randomBytes } from 'crypto'
import type { GenerationAlgorithm } from '../../../types'
import { BaseAlgorithm } from '../base'

/**
 * Represents the XORShift32 pseudorandom number generator algorithm for password generation.
 *
 * This algorithm uses a 32-bit state and bitwise XOR and shift operations to generate random numbers. It is fast and has good statistical properties, making it suitable for performance-critical applications where cryptographic security is not the primary concern.
 */
export class XORShift32Algorithm extends BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Specifies the current 32-bit state value for the XORShift generator.
     *
     * @type {number}
     * @internal
     */
    private state: number

    /**
     * Constructs a new XORShift32 algorithm instance.
     *
     * Generates a cryptographically secure random seed for the initial state. The seed is 32 bits and the algorithm ensures it is not zero.
     */
    constructor() {
        super()

        // Generate a random 32-bit seed.
        const seedBytes = randomBytes(4)
        this.state = seedBytes.readUInt32BE(0)

        // Ensure state is not zero (XORShift does not work with zero state).
        if (this.state === 0) {
            this.state = 1
        }
    }

    /**
     * Generates the next random 32-bit number using XORShift32.
     *
     * Applies the XORShift32 algorithm: x ^= x << 13; x ^= x >> 17; x ^= x << 5. This sequence provides good statistical properties and a long period.
     *
     * @returns {number} A random 32-bit integer.
     * @internal
     */
    private nextUint32(): number {
        this.state ^= this.state << 13
        this.state ^= this.state >> 17
        this.state ^= this.state << 5
        return this.state >>> 0 // Ensure positive 32-bit integer.
    }

    /**
     * Generates a random integer in the range [0, max).
     *
     * Uses XORShift32 to generate random numbers and takes modulo to ensure the result is within the desired range.
     *
     * @param {number} max - Specifies the exclusive upper bound for the random integer.
     * @returns {number} A random integer in the range [0, max).
     * @throws {Error} Thrown if max is not positive.
     * @internal
     */
    private nextInt(max: number): number {
        if (max <= 0) {
            throw new Error('Max value must be positive.')
        }

        return this.nextUint32() % max
    }

    /**
     * Generates a random password segment of the specified length using the given character set.
     *
     * Uses XORShift32 to generate random indices into the character set, ensuring each character is selected with uniform probability.
     *
     * @param {number} length - Specifies the length of the password segment to generate.
     * @param {string} characters - Specifies the character set to select from.
     * @returns {string} A random password segment of the specified length.
     * @example
     * ```ts
     * const xorshift32 = new XORShift32Algorithm();
     * const generated = xorshift32.generate(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // e.g., "KXMQPWRY"
     * ```
     */
    protected doGenerate(length: number, characters: string): string {
        let generated = ''

        for (let i = 0; i < length; i++) {
            const randomIndex = this.nextInt(characters.length)
            generated += characters[randomIndex]
        }

        return generated
    }
}
