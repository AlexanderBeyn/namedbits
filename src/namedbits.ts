const MAX_INTEGER_BITS = Math.log2(Number.MAX_SAFE_INTEGER)

const has_duplicates = <T>(arr: readonly T[]): boolean => {
    const elements = new Set(arr)
    return arr.length != elements.size
}

interface NamedBitsOptions {
    json: "string_list" | "array" | "number" | "string_bigint"
}

/**
 * Type-safe bit field with named bits
 *
 * @remarks
 * Pass a constant array of strings to the constructor for the access methods to be type-checked.
 *
 * @example
 * ```
 * > const bits = new NamedBits(["a", "b"] as const); bits.get("xxx")
 * <repl>.ts:11:64 - error TS2345: Argument of type '"xxx"' is not assignable to parameter of type '"a" | "b"'.
 *
 * 11 const bits = new NamedBits(["a", "b"] as const); bits.get("xxx")
 *                                                              ~~~~~
 * ```
 *
 */
export class NamedBits<T extends ReadonlyArray<string>> {
    private bits: Uint8Array
    private positions: Record<string, [byte: number, bit: number]>
    private options: NamedBitsOptions = { json: "string_bigint" }

    /**
     *
     * @param names - Ordered list of bit names.
     * @param options - Options to customize the bit field
     *
     * @throws List of bit names must not be empty and must not have duplicates.
     */
    constructor(public readonly names: T, options: Partial<NamedBitsOptions> = {}) {
        if (!Array.isArray(names)) {
            throw new TypeError("argument names is not an array")
        }

        if (names.length === 0) {
            throw new RangeError("missing bit names")
        }

        if (has_duplicates(names)) {
            throw new RangeError("duplicate bit names")
        }

        this.setOptions(options)

        this.bits = new Uint8Array(Math.ceil(names.length / 8))

        this.positions = names.reduce((acc, cur, idx) => {
            const byte = Math.floor(idx / 8)
            const bit = idx % 8
            return { ...acc, [cur]: [byte, bit] }
        }, {} as typeof this.positions)
    }

    private loc(name: string): typeof this.positions[string] {
        const loc = this.positions[name]
        if (!loc) {
            throw RangeError("unknown bit name")
        }
        return loc
    }

    /**
     *
     * @param options - Options to customize the bit field
     */
    setOptions(options: Partial<NamedBitsOptions>) {
        this.options = { ...this.options, ...options }
    }

    /**
     * Set a bit to a specific value, true by default. Returns the previous value of the bit.
     *
     * @param name - Bit name to set
     * @param value - New value for bit
     * @returns Old value of the bit
     * @throws Bit name must have been set at initialization
     */
    set(name: T[number], value = true): boolean {
        const [byte, bit] = this.loc(name)

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const oldValue = 0 !== (this.bits[byte]! & (1 << bit))
        const mask = 1 << bit
        if (value) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.bits[byte]! |= mask
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.bits[byte]! &= ~mask
        }
        return oldValue
    }

    /**
     * Set all bits to true
     */
    setAll() {
        for (let i = 0; i < this.bits.length; i++) {
            this.bits[i] = 255
        }
    }

    /**
     * Clear a bit (set to false).
     *
     * @param name - Bit name to clear
     * @returns Old value of the bit
     * @throws Bit name must have been set at initialization
     */
    clear(name: T[number]) {
        return this.set(name, false)
    }

    /**
     * Set all bits to false
     */
    clearAll() {
        for (let i = 0; i < this.bits.length; i++) {
            this.bits[i] = 0
        }
    }

    /**
     * Toggle a bit. Returns the previous value of the bit.
     *
     * @param name - Bit name to toggle
     * @returns Old value of the bit
     * @throws Bit name must have been set at initialization
     */
    toggle(name: T[number]): boolean {
        return this.set(name, !this.get(name))
    }

    /**
     * Get the value of a bit.
     *
     * @param name - Bit name to get
     * @returns Value of the bit
     * @throws Bit name must have been set at initialization
     */
    get(name: T[number]): boolean {
        const [byte, bit] = this.loc(name)

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return 0 !== (this.bits[byte]! & (1 << bit))
    }

    /**
     *
     * @returns List of set bit names
     */
    toArray(): T[number][] {
        return this.names.filter(name => this.get(name))
    }

    /**
     *
     * @returns Value of bit field as a number, or NaN if the bit field is too big
     */
    toNumber(): number {
        if (MAX_INTEGER_BITS < this.names.length) {
            return Number.NaN
        }

        return this.bits.reduceRight((acc, cur) => {
            return acc * 256 + cur
        }, 0)
    }

    /**
     *
     * @returns Value of bit field as a bigint
     */
    toBigInt(): bigint {
        return this.bits.reduceRight((acc, cur) => {
            return acc * BigInt(256) + BigInt(cur)
        }, BigInt(0))
    }

    /**
     *
     * @returns List of set bit names, separated by a comma
     */
    toString(): string {
        return this.toArray().join(",")
    }

    toJSON() {
        switch (this.options.json) {
            case "number":
                return this.toNumber()

            case "array":
                return this.toArray()

            case "string_list":
                return this.toString()

            case "string_bigint":
            default:
                return this.toBigInt().toString()
        }
    }
}
