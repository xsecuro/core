import { InvalidRequirementsError } from '../errors'
import type {
    GenerationAlgorithm,
    GenerationParameters,
    GenerationRequirements,
    GenerationType,
    Separator,
    SeparatorKey,
} from '../types'
import { getSeparator } from '../utils'

/**
 * Represents the finalized requirements for a generation operation.
 *
 * This interface describes the parameters after they have been validated or processed (i.e., "prepared").
 * It is used as input to generation algorithms or functions.
 */
interface GenerationPreparedRequirements {
    /**
     * Specifies the desired length of the generated result.
     *
     * @type {number}
     */
    length: number

    /**
     * Specifies all characters allowed in the generation process.
     *
     * @type {string}
     */
    characters: string
}

/**
 * Represents a password generator.
 *
 * This class generates passwords based on a configured algorithm, separator, and requirements. It supports both plain (single block) and segmented (multiple blocks) generation modes.
 */
export class Generator {
    private requirements: GenerationRequirements[]
    private preparedRequirements: GenerationPreparedRequirements[]
    private separator: Separator
    private generationType: GenerationType
    private algorithm: GenerationAlgorithm

    /**
     * Constructs a new Generator instance.
     *
     * @param {GenerationParameters} parameters - Specifies the generation parameters.
     * @throws {InvalidSeparatorKeyError} Thrown if the provided separator key is invalid.
     * @throws {InvalidRequirementsError} Thrown if segmentation is requested with fewer than two requirement blocks.
     */
    public constructor(parameters: GenerationParameters) {
        this.requirements = parameters.requirements
        this.preparedRequirements = this.getPreparedRequirements(parameters.requirements)
        this.separator = getSeparator(parameters.separator)
        this.generationType = this.getGenerationType(parameters.requirements)
        this.algorithm = parameters.algorithm
    }

    /**
     * Prepares the requirements for generation by resolving the character set and length for each block.
     *
     * @param {GenerationRequirements[]} requirements - Specifies the generation requirements.
     * @returns {GenerationPreparedRequirements[]} The array of prepared requirements.
     * @throws {InvalidRequirementsError} Thrown if no valid characters are available for generation.
     */
    private getPreparedRequirements(requirements: GenerationRequirements[]): GenerationPreparedRequirements[] {
        return requirements.map((requirements): GenerationPreparedRequirements => {
            let characters = [
                requirements.digits.include && requirements.digits.raw,
                requirements.lowercaseLetters.include && requirements.lowercaseLetters.raw,
                requirements.uppercaseLetters.include && requirements.uppercaseLetters.raw,
                requirements.specialSymbols.include && requirements.specialSymbols.raw,
            ]
                .filter(Boolean)
                .join('')

            if (this.generationType === 'segmentation') {
                characters = characters.replaceAll(this.separator, '')
            }

            if (characters.length === 0) {
                throw new InvalidRequirementsError('No valid characters available for password generation.')
            }

            return {
                length: requirements.length,
                characters: characters,
            }
        })
    }

    /**
     * Determines the generation type ('plain' or 'segmentation') based on the generation requirements.
     *
     * @param {GenerationRequirements[]} requirements - Specifies the generation requirements.
     * @returns {GenerationType} The resolved generation type.
     * @throws {InvalidRequirementsError} Thrown if no generation requirements block is specified.
     */
    private getGenerationType(requirements: GenerationRequirements[]): GenerationType {
        if (requirements.length === 1) return 'plain'
        else if (requirements.length > 1) return 'segmentation'

        throw new InvalidRequirementsError('At least one block of generation requirements is required.')
    }

    /**
     * Generates a password according to the current configuration.
     *
     * @returns {string} The generated password.
     * @example
     * ```ts
     * const algorithmFactory = new AlgorithmFactory();
     * const generator = new Generator(parameters);
     * const password = generator.generate(); // e.g., 'Hoj8m0...', 'N98hd2-fj8g$30-GHlO2d1...'
     * ```
     */
    public generate(): string {
        if (this.generationType === 'plain') {
            return this.algorithm.generate(this.preparedRequirements[0].length, this.preparedRequirements[0].characters)
        }
        return this.preparedRequirements
            .map((requirements) => this.algorithm.generate(requirements.length, requirements.characters))
            .join(this.separator)
    }

    /**
     * Updates the generation requirements.
     *
     * @remarks
     * Also recalculates the generation type (plain or segmentation).
     *
     * @param {GenerationRequirements[]} requirements - Specifies the new parameter requirements.
     * @throws {InvalidRequirementsError} Thrown if no requirements block is specified.
     *
     * @example
     * ```ts
     * const generator = new Generator(parameters);
     * generator.updateRequirements(newParameters);
     * const password = generator.generate(); // e.g., password with new requirements
     * ```
     */
    public updateRequirements(requirements: GenerationRequirements[]): void {
        // Checks for link matches. May be replaced by a deep comparison if necessary in the future.
        if (
            requirements.length === this.requirements.length &&
            requirements.every((req, i) => req === this.requirements[i])
        ) {
            return
        }

        this.requirements = requirements
        this.preparedRequirements = this.getPreparedRequirements(requirements)
        this.generationType = this.getGenerationType(requirements)
    }

    /**
     * Updates the generation separator.
     *
     * @param {SeparatorKey} separator - Specifies the new separator key to use.
     * @throws {InvalidSeparatorKeyError} Thrown if the provided separator key is invalid.
     *
     * @example
     * ```ts
     * const generator = new Generator(parameters);
     * generator.updateSeparator('hyphen');
     * const password = generator.generate(); // e.g., password with new separator
     * ```
     */
    public updateSeparator(separator: SeparatorKey): void {
        const next = getSeparator(separator)
        if (next === this.separator) return

        this.separator = next
        if (this.generationType === 'segmentation') {
            this.preparedRequirements = this.getPreparedRequirements(this.requirements)
        }
    }

    /**
     * Updates the generation algorithm.
     *
     * @param {GenerationAlgorithm} algorithm - Specifies the new generation algorithm to use.
     *
     * @example
     * ```ts
     * const algorithmFactory = new AlgorithmFactory();
     * const bbsAlgorithm = algorithmFactory.get('bbs');
     * const generator = new Generator(parameters);
     * generator.updateAlgorithm(bbsAlgorithm);
     * const password = generator.generate(); // e.g., password with new algorithm
     * ```
     */
    public updateAlgorithm(algorithm: GenerationAlgorithm): void {
        if (algorithm === this.algorithm) return

        this.algorithm = algorithm
    }
}
