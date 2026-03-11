import type { Separator, SeparatorKey } from '../types'

/**
 * Maps separator keys to their corresponding string values.
 *
 * This constant provides a mapping from logical separator keys to their actual string representations.
 */
export const separators: Record<SeparatorKey, Separator> = {
    equal: '=',
    tilde: '~',
    hyphen: '-',
    underscore: '_',
}
