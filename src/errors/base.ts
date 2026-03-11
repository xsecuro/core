import type { GenerationRequirements } from '../types'

/**
 * Represents structured metadata that can be attached to an XSecuroError.
 *
 * This type is used to provide additional context for error handling and debugging.
 */
export type XSecuroErrorMetadata =
    | Record<
          string,
          | Array<GenerationRequirements>
          | GenerationRequirements
          | string
          | number
          | boolean
          | (() => any)
          | Array<string | number | boolean | (() => any)>
          | Record<string, string | number | boolean | (() => any)>
      >
    | undefined

/**
 * Represents the base error class for all XSecuro-related errors.
 *
 * This class extends the standard Error object and adds support for structured metadata and error options.
 *
 * @example
 * ```ts
 * function validateInput(input: string) {
 *     if (input.length === 0) {
 *         throw new XSecuroError(
 *             'Input cannot be empty.',
 *             { cause: new Error('ValidationError') },
 *             { input, timestamp: Date.now() }
 *         );
 *     }
 * }
 *
 * try {
 *     validateInput('')
 * } catch (error) {
 *     if (error instanceof XSecuroError) {
 *         console.error('XSecuroError caught:', error.message);
 *         console.log('Metadata:', error.metadata);
 *         console.log('Cause:', error.options.cause);
 *     }
 * }
 * ```
 */
export class XSecuroError extends Error {
    /**
     * Specifies the standard ErrorOptions object passed to the base Error constructor.
     *
     * @readonly
     * @type {ErrorOptions}
     */
    readonly options: ErrorOptions

    /**
     * Specifies structured metadata providing additional context about the error.
     *
     * @readonly
     * @type {XSecuroErrorMetadata}
     */
    readonly metadata: XSecuroErrorMetadata

    /**
     * Constructs a new XSecuroError instance.
     *
     * @param {string} message - Specifies the error message.
     * @param {ErrorOptions} [options] - Specifies the standard error options.
     * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
     */
    constructor(message: string, options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        super(message, options)

        this.name = new.target.name
        this.options = options ?? {}
        this.metadata = metadata ?? {}

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, new.target)
        }
    }
}
