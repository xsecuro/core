import { InvalidCharactersError, InvalidLengthError } from '../../errors'
import { type GenerationAlgorithm } from '../../types'

/**
 * Represents the base abstract class for password generation algorithms.
 *
 * This class defines a shared contract and common validation for all password generation algorithms.
 * Specific algorithms must extend this class and implement the {@link BaseAlgorithm.doGenerate} method
 * to provide algorithm-specific generation logic.
 */
abstract class BaseAlgorithm implements GenerationAlgorithm {
    /**
     * Validates the input parameters for the generation process.
     *
     * Ensures that the length is a number between 7 and 10000, and that the character set
     * is a string with at least 7 characters.
     *
     * @param {number} length - Specifies the desired password length.
     * @param {string} characters - Specifies the allowed character set.
     *
     * @throws {InvalidLengthError} Thrown when the length is invalid.
     * @throws {InvalidCharactersError} Thrown when the character set is invalid.
     */
    private validateGenerationParameters(length: number, characters: string): void {
        if (typeof length !== 'number') {
            throw new InvalidLengthError('Length must be a number', undefined, { length })
        } else if (length < 7 || length > 10000) {
            throw new InvalidLengthError('Length must be between 7 and 10000', undefined, {
                length,
                minLength: 7,
                maxLength: 10000,
            })
        }

        if (typeof characters !== 'string') {
            throw new InvalidCharactersError('Characters must be a string', undefined, { characters })
        } else if (characters.length < 7) {
            throw new InvalidCharactersError('Characters must be at least 7 characters long', undefined, {
                characters,
                minLength: 7,
            })
        }
    }

    /**
     * Defines the algorithm-specific generation logic.
     *
     * @param {number} length - Specifies the desired password length.
     * @param {string} characters - Specifies the allowed character set.
     *
     * @returns {string} The generated password string.
     */
    protected abstract doGenerate(length: number, characters: string): string

    /**
     * Generates a password of the specified length using the given character set.
     *
     * The password length must be between 7 and 10000 characters.
     * The character set must contain at least 7 characters.
     *
     * @param {number} length - Specifies the desired password length.
     * @param {string} characters - Specifies the allowed character set.
     *
     * @returns {string} The generated password string.
     *
     * @throws {InvalidLengthError} Thrown when the length is invalid.
     * @throws {InvalidCharactersError} Thrown when the character set is invalid.
     *
     * @example
     * ```ts
     * class SimpleAlgorithm extends BaseAlgorithm {
     *   protected doGenerate(length: number, characters: string): string {
     *     return characters.slice(0, length)
     *   }
     * }
     *
     * const algorithm = new SimpleAlgorithm()
     * const password = algorithm.generate(12, 'abcdefghijklmnopqrstuvwxyz')
     * console.log(password) // e.g., 'abcdefghijkl'
     * ```
     */
    generate(length: number, characters: string): string {
        this.validateGenerationParameters(length, characters)
        return this.doGenerate(length, characters)
    }
}

export { BaseAlgorithm }
