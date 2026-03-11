import { randomBytes } from 'crypto'
import type { GenerationAlgorithm } from '../../types'
import { BaseAlgorithm } from './base'

/**
 * Represents the ChaCha20 pseudorandom number generator algorithm for password generation.
 *
 * This algorithm uses the ChaCha20 stream cipher to generate cryptographically secure random numbers. It is suitable for modern security and high-performance applications.
 */
export class ChaCha20Algorithm extends BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Specifies the 256-bit key for ChaCha20 (8 x 32-bit words).
     *
     * @type {Uint32Array}
     * @internal
     */
    private readonly key: Uint32Array

    /**
     * Specifies the 96-bit nonce for ChaCha20 (3 x 32-bit words).
     *
     * @type {Uint32Array}
     * @internal
     */
    private nonce: Uint32Array

    /**
     * Specifies the current keystream block from ChaCha20 transformation.
     *
     * @type {Uint32Array}
     * @internal
     */
    private keystream: Uint32Array

    /**
     * Specifies the current position in the keystream block.
     *
     * @type {number}
     * @internal
     */
    private keystreamPos: number

    /**
     * Constructs a new ChaCha20 algorithm instance.
     *
     * Automatically generates a cryptographically secure random key and nonce. The key is 256 bits (8 x 32-bit words) and the nonce is 96 bits (3 x 32-bit words).
     */
    constructor() {
        super()
        const keyBytes = randomBytes(32)
        this.key = new Uint32Array(8)
        for (let i = 0; i < 8; i++) {
            this.key[i] = keyBytes.readUInt32LE(i * 4)
        }
        const nonceBytes = randomBytes(12)
        this.nonce = new Uint32Array(3)
        for (let i = 0; i < 3; i++) {
            this.nonce[i] = nonceBytes.readUInt32LE(i * 4)
        }
        this.keystream = new Uint32Array(16)
        this.keystreamPos = 16
    }

    /**
     * Performs a circular left shift operation on a 32-bit value.
     *
     * @param {number} value - Specifies the value to rotate.
     * @param {number} shift - Specifies the number of bits to rotate left.
     * @returns {number} The rotated value.
     * @internal
     */
    private rotl(value: number, shift: number): number {
        return ((value << shift) | (value >>> (32 - shift))) >>> 0
    }

    /**
     * Applies the ChaCha20 quarter round transformation to four state words.
     *
     * This is the core operation of the ChaCha20 algorithm.
     *
     * @param {Uint32Array} state - Specifies the state array to modify.
     * @param {number} a - Specifies the first index in the state array.
     * @param {number} b - Specifies the second index in the state array.
     * @param {number} c - Specifies the third index in the state array.
     * @param {number} d - Specifies the fourth index in the state array.
     * @internal
     */
    private quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number): void {
        state[a] = (state[a] + state[b]) >>> 0
        state[d] ^= state[a]
        state[d] = this.rotl(state[d], 16)
        state[c] = (state[c] + state[d]) >>> 0
        state[b] ^= state[c]
        state[b] = this.rotl(state[b], 12)
        state[a] = (state[a] + state[b]) >>> 0
        state[d] ^= state[a]
        state[d] = this.rotl(state[d], 8)
        state[c] = (state[c] + state[d]) >>> 0
        state[b] ^= state[c]
        state[b] = this.rotl(state[b], 7)
    }

    /**
     * Generates the next keystream block using ChaCha20.
     *
     * Applies 20 rounds of ChaCha20 transformation to generate 64 bytes of keystream. The transformation includes both column rounds and diagonal rounds for thorough mixing.
     *
     * @returns {void}
     * @internal
     */
    private generateKeystreamBlock(): void {
        const state = new Uint32Array(16)
        state[0] = 0x61707865
        state[1] = 0x3320646e
        state[2] = 0x79622d32
        state[3] = 0x6b206574
        for (let i = 0; i < 8; i++) {
            state[4 + i] = this.key[i]
        }
        this.nonce[0] = (this.nonce[0] + 1) >>> 0
        state[12] = this.nonce[0]
        state[13] = this.nonce[1]
        state[14] = this.nonce[2]
        const initialState = new Uint32Array(state)
        for (let i = 0; i < 10; i++) {
            this.quarterRound(state, 0, 4, 8, 12)
            this.quarterRound(state, 1, 5, 9, 13)
            this.quarterRound(state, 2, 6, 10, 14)
            this.quarterRound(state, 3, 7, 11, 15)
            this.quarterRound(state, 0, 5, 10, 15)
            this.quarterRound(state, 1, 6, 11, 12)
            this.quarterRound(state, 2, 7, 8, 13)
            this.quarterRound(state, 3, 4, 9, 14)
        }
        for (let i = 0; i < 16; i++) {
            this.keystream[i] = (state[i] + initialState[i]) >>> 0
        }
        this.keystreamPos = 0
    }

    /**
     * Generates a random 32-bit integer.
     *
     * @returns {number} A random 32-bit integer.
     * @internal
     */
    private nextUint32(): number {
        if (this.keystreamPos >= 16) {
            this.generateKeystreamBlock()
        }
        return this.keystream[this.keystreamPos++]
    }

    /**
     * Generates a random integer in the range [0, max).
     *
     * Uses ChaCha20 to generate random numbers and applies rejection sampling to ensure uniform distribution.
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
     * Generates a random password segment of specified length using the given character set.
     *
     * Uses ChaCha20 to generate cryptographically secure random indices into the character set, ensuring each character is selected with uniform probability.
     *
     * @param {number} length - Specifies the length of the password segment to generate.
     * @param {string} characters - Specifies the character set to select from.
     * @returns {string} A random password segment of the specified length.
     *
     * @example
     * ```ts
     * const chacha20 = new ChaCha20Algorithm();
     * const generated = chacha20.generate(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // e.g., "KXMQPWRY"
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
