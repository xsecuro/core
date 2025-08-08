import { randomBytes } from 'crypto'
import type { GenerationAlgorithm } from '../../../types'
import { BaseAlgorithm } from '../base'

/**
 * Represents the XORShift128 pseudorandom number generator algorithm for password generation.
 *
 * This algorithm uses a 128-bit state (implemented as two 64-bit values) and bitwise XOR and shift operations to generate random numbers. It provides excellent statistical properties and a very long period, making it suitable for high-quality applications where cryptographic security is not the primary concern.
 */
export class XORShift128Algorithm extends BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Specifies the current 128-bit state value (implemented as two 64-bit values).
     *
     * @type {[bigint, bigint]}
     * @internal
     */
    private state: [bigint, bigint]

    /**
     * Constructs a new XORShift128 algorithm instance.
     *
     * Generates a cryptographically secure random seed for the initial state. The seed is 128 bits (two 64-bit values) and the algorithm ensures it is not zero.
     */
    constructor() {
        super()

        // Generate random 128-bit seed (two 64-bit values).
        const seedBytes = randomBytes(16)
        const high = BigInt('0x' + seedBytes.slice(0, 8).toString('hex'))
        const low = BigInt('0x' + seedBytes.slice(8, 16).toString('hex'))

        this.state = [high, low]

        // Ensure state is not zero (XORShift does not work with zero state).
        if (this.state[0] === 0n && this.state[1] === 0n) {
            this.state = [1n, 1n]
        }
    }

    /**
     * Generates the next random 64-bit number using XORShift128.
     *
     * Applies the XORShift128 algorithm with 128-bit state. Uses the high 64 bits of the state for output.
     *
     * @returns {bigint} A random 64-bit integer.
     * @internal
     */
    private nextUint64(): bigint {
        let x = this.state[0]
        const y = this.state[1]

        // XORShift128 algorithm.
        x ^= x << 23n
        x ^= x >> 17n
        x ^= y ^ (y >> 26n)

        this.state = [y, x]
        return x & 0xffffffffffffffffn // Ensure 64-bit integer.
    }

    /**
     * Generates a random integer in the range [0, max).
     *
     * Uses XORShift128 to generate random numbers and takes modulo to ensure the result is within the desired range.
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
     * Uses XORShift128 to generate random indices into the character set, ensuring each character is selected with uniform probability.
     *
     * @param {number} length - Specifies the length of the password segment to generate.
     * @param {string} characters - Specifies the character set to select from.
     * @returns {string} A random password segment of the specified length.
     * @example
     * ```ts
     * const xorshift128 = new XORShift128Algorithm();
     * const generated = xorshift128.generate(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // e.g., "KXMQPWRY"
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
