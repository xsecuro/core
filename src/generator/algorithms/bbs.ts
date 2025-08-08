import { randomBytes } from 'crypto'
import type { GenerationAlgorithm } from '../../types'
import { BaseAlgorithm } from './base'

/**
 * Represents the Blum-Blum-Shub (BBS) pseudorandom number generator algorithm for password generation.
 *
 * This algorithm is based on the quadratic residuosity problem and is cryptographically secure when using sufficiently large primes. It is suitable for high-security applications.
 */
export class BBSAlgorithm extends BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Specifies the modulus n = p * q used in the BBS algorithm.
     *
     * @type {bigint}
     * @internal
     */
    private readonly modulus: bigint
    /**
     * Specifies the current state value for the BBS generator.
     *
     * @type {bigint}
     * @internal
     */
    private state: bigint

    /**
     * Constructs a new BBS algorithm instance.
     *
     * Automatically generates two large prime numbers p and q (both congruent to 3 mod 4) and sets up the modulus. Also generates a cryptographically secure random seed for the initial state.
     * The security of the BBS algorithm depends on the size of the prime numbers used. Larger prime bits provide higher security but slower generation.
     *
     * @param {number} [primeBits=512] - Specifies the bit length for each prime number.
     * @throws {Error} Thrown if primeBits is too small for security (less than 256).
     */
    constructor(primeBits: number = 512) {
        super()

        if (typeof primeBits !== 'number' || primeBits <= 0) {
            throw new Error('Prime bits must be a positive integer.')
        }

        // Check if primeBits is within the allowed range (256-2048).
        if (primeBits < 256) {
            throw new Error('Prime bits must be at least 256 for security.')
        } else if (primeBits > 2048) {
            throw new Error('Prime bits must be less than 2048 for performance.')
        }

        // Generate two large prime numbers p and q, both congruent to 3 (mod 4).
        const p = this.generatePrime(primeBits)
        const q = this.generatePrime(primeBits)

        // Ensure p and q are different.
        if (p === q) {
            throw new Error('Generated identical prime numbers, retry needed.')
        }

        // Generate a cryptographically secure random seed.
        const seed = BigInt(parseInt(randomBytes(8).toString('hex'), 16))

        // Set the modulus and state.
        this.modulus = p * q
        this.state = seed % this.modulus
    }

    /**
     * Checks if a number is prime using the Miller-Rabin primality test.
     *
     * This is a probabilistic primality test that is very accurate for large numbers. The test uses k rounds of Miller-Rabin, which provides a probability of error less than 4^(-k).
     *
     * @param {bigint} n - Specifies the number to test for primality.
     * @param {number} [k=5] - Specifies the number of rounds for the Miller-Rabin test.
     * @returns {boolean} True if the number is probably prime, false otherwise.
     * @internal
     */
    private isPrime(n: bigint, k: number = 5): boolean {
        if (n <= 1n) return false
        if (n <= 3n) return true
        if (n % 2n === 0n) return false

        // Write n as 2^r * d + 1
        let r = 0
        let d = n - 1n
        while (d % 2n === 0n) {
            r++
            d /= 2n
        }

        // Witness loop
        for (let i = 0; i < k; i++) {
            const a = 2n + BigInt(Math.floor(Math.random() * Number(n - 4n)))
            let x = this.modPow(a, d, n)

            if (x === 1n || x === n - 1n) continue

            for (let j = 0; j < r - 1; j++) {
                x = (x * x) % n
                if (x === n - 1n) break
                if (x === 1n) return false
            }

            if (x !== n - 1n) return false
        }

        return true
    }

    /**
     * Computes modular exponentiation (a^b mod m) efficiently.
     *
     * Uses the square-and-multiply algorithm for efficient computation of large modular exponentiations.
     *
     * @param {bigint} a - Specifies the base.
     * @param {bigint} b - Specifies the exponent.
     * @param {bigint} m - Specifies the modulus.
     * @returns {bigint} The result of a^b mod m.
     * @internal
     */
    private modPow(a: bigint, b: bigint, m: bigint): bigint {
        let result = 1n
        a = a % m

        while (b > 0n) {
            if (b % 2n === 1n) {
                result = (result * a) % m
            }
            a = (a * a) % m
            b = b / 2n
        }

        return result
    }

    /**
     * Generates a random prime number of specified bit length.
     *
     * Uses cryptographically secure random number generation to create candidate prime numbers and tests them using the Miller-Rabin test. Ensures the generated prime is congruent to 3 (mod 4) as required by BBS.
     *
     * @param {number} bits - Specifies the bit length of the prime number to generate.
     * @returns {bigint} A prime number of the specified bit length.
     * @internal
     */
    private generatePrime(bits: number): bigint {
        while (true) {
            // Generate a random number of the specified bit length.
            const bytes = Math.ceil(bits / 8)
            const randomBuffer = randomBytes(bytes)
            let candidate = BigInt('0x' + randomBuffer.toString('hex'))

            // Ensure the number has the correct bit length.
            const maxValue = (1n << BigInt(bits)) - 1n
            candidate = candidate % maxValue

            // Ensure it's odd and congruent to 3 (mod 4).
            if (candidate % 2n === 0n) candidate += 1n
            if (candidate % 4n !== 3n) {
                if (candidate % 4n === 1n) candidate += 2n
                else candidate += 1n
            }

            // Test for primality.
            if (this.isPrime(candidate)) {
                return candidate
            }
        }
    }

    /**
     * Generates the next random bit using the BBS algorithm.
     *
     * Updates the internal state by squaring it modulo the modulus and returns the least significant bit of the result.
     *
     * @returns {number} A random bit (0 or 1).
     * @internal
     */
    private nextBit(): number {
        this.state = this.state ** 2n % this.modulus
        return Number(this.state % 2n)
    }

    /**
     * Generates a random integer in the range [0, max).
     *
     * Uses the BBS algorithm to generate random bits and constructs an integer from them. The result is taken modulo max to ensure it is within the desired range.
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

        let result = 0
        const bitsNeeded = Math.ceil(Math.log2(max))

        for (let i = 0; i < bitsNeeded; i++) {
            result = (result << 1) | this.nextBit()
        }

        return result % max
    }

    /**
     * Generates a random password segment of the specified length using the given character set.
     *
     * Uses the BBS algorithm to generate cryptographically secure random indices into the character set, ensuring each character is selected with uniform probability.
     *
     * @param {number} length - Specifies the length of the password segment to generate.
     * @param {string} characters - Specifies the character set to select from.
     * @returns {string} A random password segment of the specified length.
     * @example
     * ```ts
     * const bbs = new BBSAlgorithm();
     * const generated = bbs.generate(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // e.g., "KXMQPWRY"
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
