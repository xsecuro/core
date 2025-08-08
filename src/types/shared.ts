/**
 * Represents the key for resolved separator.
 *
 * Used to select a separator by its key in configuration or API.
 *
 * - 'equal': Equal sign ('=').
 * - 'tilde': Tilde ('~').
 * - 'hyphen': Hyphen ('-').
 * - 'underscore': Underscore ('_').
 */
export type SeparatorKey = 'equal' | 'tilde' | 'hyphen' | 'underscore'

/**
 * Represents the string value of resolved separator.
 *
 * Used for the actual separator character in generated output.
 *
 * - '=': Equal sign.
 * - '~': Tilde.
 * - '-': Hyphen.
 * - '_': Underscore.
 */
export type Separator = '=' | '~' | '-' | '_'
