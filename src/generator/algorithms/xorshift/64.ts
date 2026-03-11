import { randomBytes } from 'crypto'
import type { GenerationAlgorithm } from '../../../types'
import { BaseAlgorithm } from '../base'

/**
 * Represents the XORShift64 pseudorandom number generator algorithm for password generation.
 *
 * This algorithm uses a 64-bit state and bitwise XOR and shift operations to generate random numbers. It provides better statistical properties than XORShift32 and is suitable for general-purpose applications where cryptographic security is not the primary concern.
 */
export class XORShift64Algorithm extends BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Specifies the current 64-bit state value for the XORShift generator.
     *
     * @type {bigint}
     * @internal
     */
    private state: bigint

    /**
     * Constructs a new XORShift64 algorithm instance.
     *
     * Generates a cryptographically secure random seed for the initial state. The seed is 64 bits and the algorithm ensures it is not zero.
     */
    constructor() {
        super()

        // Generate a random 64-bit seed.
        const seedBytes = randomBytes(8)
        this.state = BigInt('0x' + seedBytes.toString('hex'))

        // Ensure state is not zero (XORShift does not work with zero state).
        if (this.state === 0n) {
            this.state = 1n
        }
    }

    /**
     * Generates the next random 64-bit number using XORShift64.
     *
     * Applies the XORShift64 algorithm: x ^= x << 13; x ^= x >> 7; x ^= x << 17. This sequence provides excellent statistical properties and a long period.
     *
     * @returns {bigint} A random 64-bit integer.
     * @internal
     */
    private nextUint64(): bigint {
        this.state ^= this.state << 13n
        this.state ^= this.state >> 7n
        this.state ^= this.state << 17n
        return this.state & 0xffffffffffffffffn // Ensure 64-bit integer.
    }

    /**
     * Generates a random integer in the range [0, max).
     *
     * Uses XORShift64 to generate random numbers and takes modulo to ensure the result is within the desired range.
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

        return Number(this.nextUint64() % BigInt(max))
    }

    /**
     * Generates a random password segment of the specified length using the given character set.
     *
     * Uses XORShift64 to generate random indices into the character set, ensuring each character is selected with uniform probability.
     *
     * @param {number} length - Specifies the length of the password segment to generate.
     * @param {string} characters - Specifies the character set to select from.
     * @returns {string} A random password segment of the specified length.
     * @example
     * ```
     * const xorshift64 = new XORShift64Algorithm();
     * const generated = xorshift64.generate(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // e.g., "KXMQPWRY"
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
