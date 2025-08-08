import type { SeparatorKey } from './shared'

/**
 * Represents a key for character category used in generation.
 *
 * Used to select which character groups are included.
 *
 * - 'digits': Digits (0-9).
 * - 'lowercaseLetters': Lowercase Latin letters (a-z).
 * - 'uppercaseLetters': Uppercase Latin letters (A-Z).
 * - 'specialSymbols': Special symbols.
 */
export type GenerationCharacterKey = 'digits' | 'lowercaseLetters' | 'uppercaseLetters' | 'specialSymbols'

/**
 * Represents a character category for generation.
 *
 * Contains a set of characters and a flag for inclusion.
 */
export interface GenerationCharacterDescriptor {
    /**
     * Represents the raw characters in this category.
     *
     * Used as the source set for password generation.
     *
     * @type {string}
     */
    raw: string

    /**
     * Represents whether this category is included.
     *
     * If false, characters from this category are excluded.
     *
     * @type {boolean}
     */
    include: boolean
}

/**
 * Represents a set of character categories mapped by their keys.
 *
 * Used to define all available character groups.
 */
export type GenerationCharacterSet = Record<GenerationCharacterKey, GenerationCharacterDescriptor>

/**
 * Represents the requirements for generation, including sets and length.
 *
 * Extends the character set with a required length property.
 */
export interface GenerationRequirements extends GenerationCharacterSet {
    /**
     * Represents the length of the string to generate.
     *
     * Determines the total number of characters in the output.
     *
     * @type {number}
     */
    length: number
}

/**
 * Represents the name of a generation algorithm.
 *
 * Used to identify a specific algorithm implementation.
 */
export type GenerationAlgorithmName = string

/**
 * Represents the interface for a string generation algorithm.
 *
 * Contract for all algorithm implementations.
 */
export interface GenerationAlgorithm {
    /**
     * Represents the method to generate a string from allowed characters.
     *
     * Main entry point for algorithm implementations.
     *
     * @param {number} length - Represents the length of the string to generate.
     * @param {string} characters - Represents the allowed character set for generation.
     * @returns {string} The generated string.
     */
    generate(length: number, characters: string): string
}

/**
 * Represents the generation mode.
 *
 * Controls whether generation is single block or segmented.
 *
 * - 'plain': Single block generation.
 * - 'segmentation': Multiple blocks separated by a separator.
 */
export type GenerationType = 'plain' | 'segmentation'

/**
 * Represents the parameters for controlling the generation process.
 *
 * Used to configure requirements, separator, and algorithm.
 */
export interface GenerationParameters {
    /**
     * Represents the list of requirements for each segment or block.
     *
     * Each entry defines constraints for a part of the generated string.
     *
     * @type {GenerationRequirements[]}
     */
    requirements: GenerationRequirements[]

    /**
     * Represents the separator key to use between segments.
     *
     * Determines which character separates generated blocks.
     *
     * @type {SeparatorKey}
     */
    separator: SeparatorKey

    /**
     * Represents the algorithm instance to use for generation.
     *
     * Determines the randomization method applied.
     *
     * @type {GenerationAlgorithm}
     */
    algorithm: GenerationAlgorithm
}
