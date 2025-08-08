import { AlgorithmCreatorImplementationError, AlgorithmNameError, AlgorithmNotRegisteredError } from '../../errors'
import type { GenerationAlgorithm, GenerationAlgorithmName } from '../../types'
import { AESCTRAlgorithm } from './aes-ctr'
import { BaseAlgorithm } from './base'
import { BBSAlgorithm } from './bbs'
import { ChaCha20Algorithm } from './chacha20'
import { PCGAlgorithm } from './pcg'
import { XORShift128Algorithm, XORShift32Algorithm, XORShift64Algorithm } from './xorshift'

/**
 * Represents options for registering an algorithm.
 */
export interface RegisterAlgorithmOptions {
    /**
     * Specifies whether to override an existing algorithm with the same name.
     *
     * @type {boolean}
     */
    override?: boolean

    /**
     * Specifies whether to validate the creator by instantiating once at registration time.
     *
     * @type {boolean}
     */
    validateWithInstance?: boolean
}

/**
 * Represents a factory for creating and managing generation algorithms.
 *
 * This factory maintains a registry of algorithm creators and supports registering custom or built-in algorithms. It ensures consistent validation and allows retrieving new instances on demand.
 */
export class AlgorithmFactory {
    /**
     * Specifies the registry of available algorithm creators mapped by their names.
     *
     * @type {Map<GenerationAlgorithmName, () => GenerationAlgorithm>}
     * @private
     */
    private algorithms: Map<GenerationAlgorithmName, () => GenerationAlgorithm> = new Map()

    /**
     * Constructs a new AlgorithmFactory instance and registers all built-in algorithms.
     */
    constructor() {
        this.registerBuiltIn()
    }

    /**
     * Registers a new algorithm in the factory.
     *
     * @param {GenerationAlgorithmName} name - Specifies the unique name of the algorithm.
     * @param {() => GenerationAlgorithm} creator - Specifies a function returning a new instance of the algorithm.
     * @param {RegisterAlgorithmOptions} [options] - Specifies options controlling registration behavior.
     * @throws {AlgorithmNameError} Thrown when the name is invalid or duplicate without override.
     * @throws {AlgorithmCreatorImplementationError} Thrown when the creator is invalid or fails validation.
     * @example
     * ```ts
     * factory.register('SimpleAlgorithm', () => new SimpleAlgorithm());
     *
     * factory.register('BBS', () => new BBSAlgorithm(), { override: true });
     * ```
     */
    public register(
        name: GenerationAlgorithmName,
        creator: () => GenerationAlgorithm,
        options: RegisterAlgorithmOptions = {}
    ): void {
        const { override = false, validateWithInstance = true } = options

        if (typeof name !== 'string' || name.trim() === '') {
            throw new AlgorithmNameError('Algorithm name must be a non-empty string.', undefined, { name })
        }

        if (this.algorithms.has(name) && !override) {
            throw new AlgorithmNameError(`Algorithm '${name}' is already registered.`, undefined, { name })
        }

        if (typeof creator !== 'function') {
            throw new AlgorithmCreatorImplementationError('Algorithm creator must be a function.', undefined, {
                creator,
            })
        }

        if (validateWithInstance) {
            const testInstance = creator()
            if (!(testInstance instanceof BaseAlgorithm)) {
                throw new AlgorithmCreatorImplementationError(
                    `Algorithm '${name}' must return a BaseAlgorithm implementation.`,
                    undefined,
                    { creator }
                )
            }
        }

        this.algorithms.set(name, creator)
    }

    /**
     * Registers all built-in algorithms.
     *
     * @param {boolean} [override=true] - Specifies whether to replace existing registrations.
     * @example
     * ```ts
     * factory.registerBuiltIn();
     * factory.registerBuiltIn(false);
     * ```
     */
    public registerBuiltIn(override: boolean = true): void {
        this.register('BBS', () => new BBSAlgorithm(), { override, validateWithInstance: false })
        this.register('PCG', () => new PCGAlgorithm(), { override, validateWithInstance: false })
        this.register('AES-CTR', () => new AESCTRAlgorithm(), { override, validateWithInstance: false })
        this.register('ChaCha20', () => new ChaCha20Algorithm(), { override, validateWithInstance: false })
        this.register('XORShift32', () => new XORShift32Algorithm(), { override, validateWithInstance: false })
        this.register('XORShift64', () => new XORShift64Algorithm(), { override, validateWithInstance: false })
        this.register('XORShift128', () => new XORShift128Algorithm(), { override, validateWithInstance: false })
    }

    /**
     * Checks whether the specified algorithm is registered.
     *
     * @param {GenerationAlgorithmName} name - Specifies the name of the algorithm to check.
     * @returns {boolean} True if the algorithm is registered, false otherwise.
     * @example
     * ```ts
     * factory.has('BBS'); // e.g., true
     * factory.has('SimpleAlgorithm'); // e.g., false
     * ```
     */
    public has(name: GenerationAlgorithmName): boolean {
        return this.algorithms.has(name)
    }

    /**
     * Returns a new instance of the specified algorithm.
     *
     * @param {GenerationAlgorithmName} name - Specifies the name of the algorithm to retrieve.
     * @returns {GenerationAlgorithm} A new instance of the specified algorithm.
     * @throws {AlgorithmNotRegisteredError} Thrown when the algorithm is not registered.
     * @example
     * ```ts
     * const bbs = factory.get('BBS');
     * ```
     */
    public get(name: GenerationAlgorithmName): GenerationAlgorithm {
        if (!this.has(name)) {
            throw new AlgorithmNotRegisteredError(`Algorithm '${name}' is not registered.`)
        }
        return this.algorithms.get(name)!()
    }

    /**
     * Returns a list of all registered algorithm names.
     *
     * @returns {Array<GenerationAlgorithmName>} An array of all registered algorithm names.
     * @example
     * ```ts
     * const names = factory.getAvailableAlgorithmNames();
     * console.log(names); // e.g. ['BBS', 'PCG', ...]
     * ```
     */
    public getAvailableAlgorithmNames(): Array<GenerationAlgorithmName> {
        return Array.from(this.algorithms.keys())
    }

    /**
     * Removes the specified algorithm from the registry.
     *
     * @param {GenerationAlgorithmName} name - Specifies the name of the algorithm to unregister.
     * @returns {boolean} True if the algorithm was removed, false if it was not registered.
     * @example
     * ```ts
     * factory.unregister('BBS');
     * ```
     */
    public unregister(name: GenerationAlgorithmName): boolean {
        return this.algorithms.delete(name)
    }

    /**
     * Removes all registered algorithms.
     *
     * @example
     * ```ts
     * factory.clear();
     * ```
     */
    public clear(): void {
        this.algorithms.clear()
    }
}
