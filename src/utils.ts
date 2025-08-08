import { Separators } from './constants'
import { InvalidSeparatorKeyError, InvalidSeparatorValueError } from './errors'
import type { Separator, SeparatorKey } from './types'

/**
 * Returns the separator string for a given separator key.
 *
 * @param {SeparatorKey} separatorKey - Specifies the separator key.
 * @returns {Separator} The resolved separator string.
 * @throws {InvalidSeparatorKeyError} Thrown if the provided separator key is invalid.
 */
function getSeparator(separatorKey: SeparatorKey): Separator {
    const separator = Separators[separatorKey]
    if (!separator) {
        throw new InvalidSeparatorKeyError(undefined, undefined, {
            separatorKey,
            availableSeparatorKeys: Object.keys(Separators),
        })
    }
    return separator
}

/**
 * Returns the separator key for a given separator string value.
 *
 * @param {Separator} separator - Specifies the separator string value.
 * @returns {SeparatorKey} The resolved separator key.
 * @throws {InvalidSeparatorValueError} Thrown if the separator value is invalid.
 */
function getSeparatorKey(separator: Separator): SeparatorKey {
    const entry = Object.entries(Separators).find(([, value]) => value === separator)
    if (!entry) {
        throw new InvalidSeparatorValueError(undefined, undefined, {
            separatorValue: separator,
            availableSeparatorValues: Object.values(Separators),
        })
    }
    return entry[0] as SeparatorKey
}

export { getSeparator, getSeparatorKey }
