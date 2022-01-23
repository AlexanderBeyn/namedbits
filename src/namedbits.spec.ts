import { NamedBits } from "./namedbits"

describe("instantiation", () => {
    test("with valid keys", () => {
        expect(() => new NamedBits(["a", "b", "c"])).not.toThrow()
    })

    test("with 1000 keys", () => {
        const keys = Array.from(Array(1000)).map((_v, idx) => String(idx))
        expect(() => new NamedBits(keys)).not.toThrow()
    })

    test("with duplicate keys", () => {
        expect(() => new NamedBits(["a", "b", "a"])).toThrow(RangeError)
    })

    test("with no keys", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => new NamedBits(undefined as any)).toThrow(TypeError)

        expect(() => new NamedBits([])).toThrow(RangeError)
    })
})

describe("operations", () => {
    let bits: NamedBits<string[]>

    beforeEach(() => {
        bits = new NamedBits(["a", "b", "c"])
    })

    test("set and get", () => {
        bits.set("a")
        bits.set("c")
        expect(bits.get("a")).toBe(true)
        expect(bits.get("b")).toBe(false)
        expect(bits.get("c")).toBe(true)
    })

    test("setAll", () => {
        bits.setAll()
        expect(bits.get("a")).toBe(true)
        expect(bits.get("b")).toBe(true)
        expect(bits.get("c")).toBe(true)
    })

    test("clearAll", () => {
        bits.set("b")
        bits.clearAll()
        expect(bits.get("a")).toBe(false)
        expect(bits.get("b")).toBe(false)
        expect(bits.get("c")).toBe(false)
    })

    test("toggle", () => {
        bits.toggle("a")
        bits.set("b")
        bits.toggle("b")
        expect(bits.get("a")).toBe(true)
        expect(bits.get("b")).toBe(false)
        expect(bits.get("c")).toBe(false)
    })

    test("clear", () => {
        bits.setAll()
        bits.clear("b")
        expect(bits.get("a")).toBe(true)
        expect(bits.get("b")).toBe(false)
        expect(bits.get("c")).toBe(true)
    })

    test("unknown name", () => {
        expect(() => bits.set("xxx")).toThrow(RangeError)
    })
})

describe("conversions", () => {
    let bits: NamedBits<["a", "b", "c"]>

    beforeEach(() => {
        bits = new NamedBits(["a", "b", "c"])
    })

    test("toNumber", () => {
        bits.set("a")
        bits.set("c")
        expect(bits.toNumber()).toBe(5)
    })

    test("toBigInt", () => {
        bits.set("a")
        bits.set("c")
        expect(bits.toBigInt()).toBe(BigInt(5))
    })

    test("toString", () => {
        bits.set("a")
        bits.set("c")
        expect(bits.toString()).toBe("a,c")
    })

    test("toArray", () => {
        bits.set("a")
        bits.set("c")
        expect(bits.toArray()).toStrictEqual(["a", "c"])
    })
})

describe("50 position bit fields", () => {
    const keys = Array.from(Array(50)).map((_v, idx) => String(idx))
    let bits: NamedBits<typeof keys>

    beforeEach(() => {
        bits = new NamedBits(keys)
    })

    test("toNumber", () => {
        bits.set("4")
        bits.set("40")
        expect(bits.toNumber()).toBe(1099511627792)
    })
})

describe("1000 position bit fields", () => {
    const keys = Array.from(Array(1000)).map((_v, idx) => String(idx))
    let bits: NamedBits<typeof keys>

    beforeEach(() => {
        bits = new NamedBits(keys)
    })

    test("set and get", () => {
        bits.set("500")
        expect(bits.get("5")).toBe(false)
        expect(bits.get("50")).toBe(false)
        expect(bits.get("500")).toBe(true)
    })

    test("toNumber", () => {
        bits.set("5")
        bits.set("50")
        bits.set("500")
        expect(bits.toNumber()).toBeNaN()
    })

    test("toBigInt", () => {
        bits.set("5")
        bits.set("50")
        bits.set("500")
        expect(bits.toBigInt()).toBe(
            BigInt(
                "3273390607896141870013189696827599152216642046043064789483291368096133796404674554883270092325904157150886684127560071009217256545885394179228434432032",
            ),
        )
    })

    test("toArray", () => {
        bits.set("5")
        bits.set("50")
        bits.set("500")
        expect(bits.toArray()).toStrictEqual(["5", "50", "500"])
    })
})

describe("conversions to JSON", () => {
    let bits: NamedBits<["a", "b", "c"]>

    beforeEach(() => {
        bits = new NamedBits(["a", "b", "c"])
        bits.set("a")
        bits.set("c")
    })

    test("as array", () => {
        bits.setOptions({ json: "array" })
        expect(JSON.stringify({ bits })).toBe('{"bits":["a","c"]}')
    })

    test("as number", () => {
        bits.setOptions({ json: "number" })
        expect(JSON.stringify({ bits })).toBe('{"bits":5}')
    })

    test("as string list", () => {
        bits.setOptions({ json: "string_list" })
        expect(JSON.stringify({ bits })).toBe('{"bits":"a,c"}')
    })

    test("as string bigint", () => {
        bits.setOptions({ json: "string_bigint" })
        expect(JSON.stringify({ bits })).toBe('{"bits":"5"}')
    })
})
