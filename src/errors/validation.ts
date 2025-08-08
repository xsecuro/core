import { XSecuroError, type XSecuroErrorMetadata } from './base'

/**
 * Represents an error thrown when the requested password length is invalid.
 *
 * This error supports structured metadata for length constraints.
 *
 * @param {string} [message='Invalid length'] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new InvalidLengthError('Length must be between 8 and 16.', undefined, {
 *   length: 5,
 *   minLength: 8,
 *   maxLength: 16,
 * });
 * ```
 */
export class InvalidLengthError extends XSecuroError {
    constructor(message: string = 'Invalid length', options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        super(message, options, metadata)
    }
}

/**
 * Represents an error thrown when the provided character set is invalid or contains unsupported characters.
 *
 * This error supports structured metadata for character constraints.
 *
 * @param {string} [message='Invalid characters'] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new InvalidCharactersError('Invalid characters detected.', undefined, {
 *   characters: '@#$%',
 *   minLength: 8,
 * });
 * ```
 */
export class InvalidCharactersError extends XSecuroError {
    constructor(message: string = 'Invalid characters', options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        super(message, options, metadata)
    }
}

/**
 * Represents an error thrown when attempting to retrieve an algorithm that is not registered.
 *
 * This error supports structured metadata for the algorithm name.
 *
 * @param {string} [message='Algorithm not registered'] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new AlgorithmNotRegisteredError('Algorithm not found.', undefined, {
 *   algorithmName: 'customAlgo',
 * });
 * ```
 */
export class AlgorithmNotRegisteredError extends XSecuroError {
    constructor(message: string = 'Algorithm not registered', options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        super(message, options, metadata)
    }
}

/**
 * Represents an error thrown when the algorithm name is invalid.
 *
 * This error supports structured metadata for the algorithm name.
 *
 * @param {string} [message='Invalid algorithm name'] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new AlgorithmNameError('Algorithm name is invalid.', undefined, {
 *   algorithmName: '123Invalid',
 * });
 * ```
 */
export class AlgorithmNameError extends XSecuroError {
    constructor(message: string = 'Invalid algorithm name', options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        super(message, options, metadata)
    }
}

/**
 * Represents an error thrown when the algorithm creator function is invalid.
 *
 * This error supports structured metadata for the creator function.
 *
 * @param {string} [message='Invalid algorithm creator implementation'] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new AlgorithmCreatorImplementationError('Creator function is invalid.', undefined, {
 *   creator: someInvalidFunction,
 * });
 * ```
 */
export class AlgorithmCreatorImplementationError extends XSecuroError {
    constructor(
        message: string = 'Invalid algorithm creator implementation',
        options?: ErrorOptions,
        metadata?: XSecuroErrorMetadata
    ) {
        super(message, options, metadata)
    }
}

/**
 * Represents an error thrown when the requirements are invalid.
 *
 * This error supports structured metadata for the requirements.
 *
 * @param {string} [message='Invalid requirements'] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new InvalidRequirementsError('Requirements do not meet criteria.', undefined, {
 *   requirements: invalidRequirements,
 * });
 * ```
 */
export class InvalidRequirementsError extends XSecuroError {
    constructor(message: string = 'Invalid requirements', options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        super(message, options, metadata)
    }
}

/**
 * Represents an error thrown when the separator key is invalid.
 *
 * This error supports structured metadata for the separator key and available keys.
 *
 * @param {string} [message] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @remarks
 * If no message is provided, a default message is generated using the metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new InvalidSeparatorKeyError(undefined, undefined, {
 *   separatorKey: 'invalidKey',
 *   availableSeparatorKeys: ['equal', 'tilde', 'hyphen', 'underscore'],
 * });
 * ```
 */
export class InvalidSeparatorKeyError extends XSecuroError {
    public constructor(message?: string, options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        const defaultMessage = 'Invalid separator key.'

        if (
            metadata?.separatorKey &&
            Array.isArray(metadata?.availableSeparatorKeys) &&
            metadata.availableSeparatorKeys.length
        ) {
            const separatorKey = metadata.separatorKey as string
            const availableSeparatorKeys = (metadata.availableSeparatorKeys as Array<string>).join(', ')
            message = `${defaultMessage.slice(0, -1)}: ${separatorKey}. Must be one of: ${availableSeparatorKeys}.`
        }

        super(message ?? defaultMessage, options, metadata)
    }
}

/**
 * Represents an error thrown when the separator value is invalid.
 *
 * This error supports structured metadata for the separator value and available values.
 *
 * @param {string} [message] - Specifies the error message.
 * @param {ErrorOptions} [options] - Specifies the standard error options.
 * @param {XSecuroErrorMetadata} [metadata] - Specifies the structured metadata.
 * @remarks
 * If no message is provided, a default message is generated using the metadata.
 * @extends {XSecuroError}
 * @example
 * ```ts
 * throw new InvalidSeparatorValueError(undefined, undefined, {
 *   separatorValue: '%',
 *   availableSeparatorValues: ['=', '~', '-', '_'],
 * });
 * ```
 */
export class InvalidSeparatorValueError extends XSecuroError {
    constructor(message?: string, options?: ErrorOptions, metadata?: XSecuroErrorMetadata) {
        const defaultMessage = 'Invalid separator value.'

        if (
            metadata?.separatorValue &&
            Array.isArray(metadata?.availableSeparatorValues) &&
            metadata.availableSeparatorValues.length
        ) {
            const separatorValue = metadata.separatorValue as string
            const availableSeparatorValues = (metadata.availableSeparatorValues as Array<string>).join(', ')
            message = `${defaultMessage.slice(0, -1)}: ${separatorValue}. Must be one of: ${availableSeparatorValues}.`
        }

        super(message ?? defaultMessage, options, metadata)
    }
}
