import { createCipheriv, randomBytes } from 'crypto'
import type { GenerationAlgorithm } from '../../types'
import { BaseAlgorithm } from './base'

/**
 * Represents the AES-CTR (Advanced Encryption Standard in Counter Mode) algorithm for password generation.
 *
 * This algorithm uses AES encryption in counter mode to generate cryptographically secure random numbers. It is suitable for high-performance and security-critical applications.
 */
export class AESCTRAlgorithm extends BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Specifies the 256-bit AES key for encryption.
     *
     * @type {Buffer}
     * @internal
     */
    private readonly key: Buffer

    /**
     * Specifies the 128-bit nonce for counter mode.
     *
     * @type {Buffer}
     * @internal
     */
    private nonce: Buffer

    /**
     * Specifies the current counter value for CTR mode.
     *
     * @type {bigint}
     * @internal
     */
    private counter: bigint

    /**
     * Specifies the current keystream block from AES encryption.
     *
     * @type {Buffer}
     * @internal
     */
    private keystream: Buffer

    /**
     * Specifies the current position in the keystream block.
     *
     * @type {number}
     * @internal
     */
    private keystreamPos: number

    /**
     * Constructs a new AES-CTR algorithm instance.
     *
     * Automatically generates a cryptographically secure random key and nonce. The key is 256 bits (32 bytes) and the nonce is 128 bits (16 bytes).
     */
    constructor() {
        super()
        this.key = randomBytes(32)
        this.nonce = randomBytes(16)
        this.counter = 0n
        this.keystream = Buffer.alloc(16)
        this.keystreamPos = 16
    }

    /**
     * Generates the next keystream block using AES-CTR.
     *
     * Encrypts the current counter value with AES to generate 16 bytes of keystream. The counter is combined with the nonce to create the input block for AES encryption.
     *
     * @returns {void}
     * @internal
     */
    private generateKeystreamBlock(): void {
        const counterBlock = Buffer.alloc(16)
        this.nonce.copy(counterBlock, 0, 0, 12)
        const counterBytes = Buffer.alloc(4)
        counterBytes.writeUInt32BE(Number(this.counter & 0xffffffffn), 0)
        counterBytes.copy(counterBlock, 12, 0, 4)
        const cipher = createCipheriv('aes-256-ecb', this.key, null)
        cipher.setAutoPadding(false)
        this.keystream = Buffer.concat([cipher.update(counterBlock), cipher.final()])
        this.counter = (this.counter + 1n) & 0xffffffffn
        this.keystreamPos = 0
    }

    /**
     * Generates a random 32-bit integer.
     *
     * @returns {number} A random 32-bit integer.
     * @internal
     */
    private nextUint32(): number {
        if (this.keystreamPos >= 12) {
            this.generateKeystreamBlock()
        }
        const result = this.keystream.readUInt32BE(this.keystreamPos)
        this.keystreamPos += 4
        return result
    }

    /**
     * Generates a random integer in the range [0, max).
     *
     * Uses AES-CTR to generate random numbers and applies rejection sampling to ensure uniform distribution.
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
     * Uses AES-CTR to generate cryptographically secure random indices into the character set, ensuring each character is selected with uniform probability.
     *
     * @param {number} length - Specifies the length of the password segment to generate.
     * @param {string} characters - Specifies the character set to select from.
     * @returns {string} A random password segment of the specified length.
     *
     * @example
     * ```ts
     * const aesCtr = new AESCTRAlgorithm();
     * const generated = aesCtr.generate(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // e.d., "KXMQPWRY"
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
