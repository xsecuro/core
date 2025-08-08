import { randomBytes } from 'crypto'
import type { GenerationAlgorithm } from '../../types'
import { BaseAlgorithm } from './base'

/**
 * Represents the PCG (Permuted Congruential Generator) algorithm for password generation.
 *
 * This algorithm is a modern pseudorandom number generator with excellent statistical properties, long period, and high performance. It is suitable for general-purpose and high-performance applications.
 */
export class PCGAlgorithm extends BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Specifies the 64-bit state of the PCG generator.
     *
     * @type {bigint}
     * @internal
     */
    private state: bigint

    /**
     * Specifies the multiplier used in the linear congruential generator.
     *
     * @type {bigint}
     * @internal
     */
    private readonly multiplier: bigint

    /**
     * Specifies the increment used in the linear congruential generator.
     *
     * @type {bigint}
     * @internal
     */
    private readonly increment: bigint

    /**
     * Constructs a new PCG algorithm instance.
     *
     * Initializes the generator with a cryptographically secure 64-bit random seed and recommended constants for PCG-XSH-RR. Ensures that the state is never zero.
     */
    constructor() {
        super()
        const seedBytes = randomBytes(8)
        this.state = BigInt('0x' + seedBytes.toString('hex'))
        this.multiplier = 6364136223846793005n
        this.increment = 1442695040888963407n
        if (this.state === 0n) {
            this.state = 1n
        }
    }

    /**
     * Generates the next random 32-bit number using PCG-XSH-RR.
     *
     * Updates the internal state using a linear congruential generator, applies the XSH-RR permutation, and returns a uniformly distributed 32-bit integer.
     *
     * @returns {number} A random 32-bit integer.
     * @internal
     */
    private nextUint32(): number {
        this.state = (this.state * this.multiplier + this.increment) & 0xffffffffffffffffn
        const xsh = Number((this.state >> 18n) ^ this.state)
        return (xsh >> 27) & 0xffffffff
    }

    /**
     * Generates a random integer in the range [0, max).
     *
     * Uses rejection sampling to ensure uniform distribution of random integers below the specified upper bound.
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
        const mask = (1 << Math.ceil(Math.log2(max))) - 1
        let result: number
        do {
            result = this.nextUint32() & mask
        } while (result >= max)
        return result
    }

    /**
     * Generates a random password segment of the specified length using the given character set.
     *
     * Uses the PCG algorithm to produce random indices into the character set, ensuring uniform selection for each character.
     *
     * @param {number} length - Specifies the length of the password segment to generate.
     * @param {string} characters - Specifies the character set to select from.
     * @returns {string} A random password segment of the specified length.
     *
     * @example
     * ```ts
     * const pcg = new PCGAlgorithm();
     * const generated = pcg.generate(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // e.g., "KXMQPWRY"
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
