export class NSClass {
    /** @param {import(".").NS} ns */
    constructor(ns) {
        this.ns = ns

    }
    /// Properties
    get events() { return new Events(this.ns) }
    get logging() { return new Logging(this.ns) }
    get messaging() { return new Messaging(this.ns) }
    get ports() { return new Ports(this.ns) }
    /// Functions
    /** Terminates the current script immediately. */
    exit() { this.ns.exit() }
    /**
     * Parse command line flags.
     * @param {[string, string | number | boolean | string[]][]} defaultFlags
     * @returns {[string, string | number | boolean | string[]][]}
    */
    flags(defaultFlags) { return this.ns.exit(defaultFlags) }
    /// Async Functions
    /**
     * Suspends the script for n milliseconds. Doesn't block with concurrent calls.
     * @param {number} ms
    */
    async asleep(ms) { await this.ns.asleep(ms) }
    /**
     * Suspends the script for n milliseconds.
     * @param {number} ms
    */
    async sleep(ms) { await this.ns.sleep(ms) }
}
class Events {
    /** @param {import(".").NS} ns */
    constructor(ns) {
        this.ns = ns
    }
    /// Functions
    /** Add callback function when the script dies
     * @param {() => void} f
    */
    atExit(f) { this.ns.atExit(f) }
}
class Logging {
    /** @param {import(".").NS} ns */
    constructor(ns) {
        this.ns = ns
    }
    /// Functions
    /** Clears the script's logs. */
    clearLog() { this.ns.clearLog() }
    /** Disables logging for the given function.
     * @param {string} fn
    */
    disableLog(fn) { this.ns.disableLog(fn) }
    /** Disables logging for the given function.
     * @param {string} fn
    */
    disableLogAll() { this.disableLog("ALL") }
    /** Enables logging for the given function.
     * @param {string} fn
    */
    enableLog(fn) { this.ns.enableLog(fn) }
    /** Enables logging for the given function.
     * @param {string} fn
    */
    enableLog() { this.enableLog("ALL") }
    /** Enables logging for the given function.
     * @param {string} fn
    */
    /** Checks the status of the logging for the given function.
     * @param {string} fn
    */
    isLogEnabled(fn) { this.ns.isLogEnabled(fn) }
    /** Checks the status of the logging for every function.
     * @param {string} fn
    */
    isLogEnabled() { this.isLogEnabled("ALL") }
    /** Prints one or move values or variables to the script’s logs.
     * @param {string} message
    */
    print(message) { this.ns.print(message) }
}
class Messaging {
    /** @param {import(".").NS} ns */
    constructor(ns) {
        this.ns = ns
    }
    /// Functions
    /** Opens an Alert Message Box
     * @param {string} message
    */
    alert(message) { this.ns.alert(message) }
    /** Format a number http://numeraljs.com/
     * @param {number} n
     * @param {string} format
     * @returns {string}
    */
    nFormat(n, format) { return this.ns.nFormat(n, format) }
    /** Prompt the player with a Yes/No modal.
     * @param {string} message
     * @returns {boolean}
    */
    prompt(message) { return this.ns.prompt(message) }
    /** Format a string. https://github.com/alexei/sprintf.js
     * @param {string} format
     * @param {string[]} args
     * @returns {string}
    */
    sprintf(format, ...args) { return this.ns.sprintf(format, args) }
    /** Format time to readable string https://github.com/alexei/sprintf.js
     * @param {number} milliseconds
     * @param {boolean?} milliPrecision
     * @returns {string}
    */
    tFormat(milliseconds, milliPrecision) { return this.ns.tFormat(milliseconds, milliPrecision) }
    /** Queue a toast (bottom-right notification).
     * @param {string} message
     * @param {ToastTypes} variant
     * @param {number} duration
    */
    toast(message, variant, duration) { return this.ns.toast(message, variant, duration) }
    /** Prints one or more values or variables to the Terminal.
     * @param {string} message
    */
    tprint(message) { return this.ns.tprint(message) }
    /** Format a string with an array of arguments. https://github.com/alexei/sprintf.js
     * @param {string} format
     * @param {string[]} args
     * @returns {string}
    */
    vsprintf(format, args) { return this.ns.vsprintf(format, args) }
}
export const ToastTypes = Object.freeze({
    success: "success",
    info: "info",
    warning: "warning",
    error: "error",
})
class Ports {
    /** @param {import(".").NS} ns */
    constructor(ns) {
        this.ns = ns
    }
    get port01() { return new Port(this.ns, 1) }
    get port02() { return new Port(this.ns, 2) }
    get port03() { return new Port(this.ns, 3) }
    get port04() { return new Port(this.ns, 4) }
    get port05() { return new Port(this.ns, 5) }
    get port06() { return new Port(this.ns, 6) }
    get port07() { return new Port(this.ns, 7) }
    get port08() { return new Port(this.ns, 8) }
    get port09() { return new Port(this.ns, 9) }
    get port10() { return new Port(this.ns, 10) }
    get port11() { return new Port(this.ns, 11) }
    get port12() { return new Port(this.ns, 12) }
    get port13() { return new Port(this.ns, 13) }
    get port14() { return new Port(this.ns, 14) }
    get port15() { return new Port(this.ns, 15) }
    get port16() { return new Port(this.ns, 16) }
    get port17() { return new Port(this.ns, 17) }
    get port18() { return new Port(this.ns, 18) }
    get port19() { return new Port(this.ns, 19) }
    get port20() { return new Port(this.ns, 20) }
}
class Port {
    /** @param {import(".").NS} ns */
    constructor(ns, port) {
        this.portHandler = ns.getPortHandle(port)
    }
    /// Properties
    /** Tells you if buffer is full.
     * @returns {boolean}
    */
    get isFull() { return this.portHandler.full() }
    /** Reads Oldest Data and then removed it.
     * @returns {any}
    */
    get next() { return this.portHandler.read() }
    /** Reads Oldest Data.
     * @returns {any}
    */
    get peek() { return this.portHandler.peek() }
    /// Functions
    /** Empties buffer fully.
     * @param {any} data
     * @returns {boolean}
    */
    clear(data) { return this.portHandler.clear() }
    /** Writes Data To Port. Won't Override Data.
     * @param {any} data
     * @returns {boolean}
    */
    tryWrite(data) { return this.portHandler.tryWrite(data) }
    /** Writes Data To Port. Kicks Oldest Data Out.
     * @param {any} data
    */
    write(data) { this.portHandler.write(data) }
}