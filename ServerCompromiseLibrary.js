import { NSClass } from "./nsLibrary";

export class ServerCompromiser extends NSClass {
    constructor(ns, server) {
        super(ns)
        this.server = server
    }
    /// Properties
    get hasRootAccess() { return this.ns.hasRootAccess(this.server) }
    get portsRequired() { return this.ns.getServerNumPortsRequired(this.server) }
    get portsThatCanBeOpened() {
        return PortOpener.all(ns).reduce((val, po) => {
            if (po.exsists) { return val + 1 }
        }, 0)
    }
    get canNuke() { return this.portsThatCanBeOpened >= this.portsRequired }
    /// Functions
    /** Runs BruteSSH.exe on a server. */
    brutessh() { PortOpener.brutessh(this.ns).run }
    /** Runs FTPCrack.exe on a server. */
    ftpcrack() { PortOpener.ftpcrack(this.ns).run }
    /** Runs HTTPWorm.exe on a server. */
    httpworm() { PortOpener.httpworm(this.ns).run }
    /** Runs HTTPWorm.exe on a server. */
    relaysmtp() { PortOpener.relaysmtp(this.ns).run }
    /** Runs HTTPWorm.exe on a server. */
    sqlinject() { PortOpener.sqlinject(this.ns).run }
    /** Runs HTTPWorm.exe on a server. */
    nuke() {
        if (this.canNuke == false) { return }
        this.ns.nuke(this.server)
    }
}
class PortOpener {
    constructor(ns, file, fn) {
        this.ns = ns
        this.file = file
        this.fn = fn
    }
    /**
     * Checks if files exsists.
     * @param {string} file
     * @returns {boolean}
     * */
    get exsists() { return this.ns.fileExsists(this.file) }
    run(server) {
        if (this.exsists == false) { return }
        this.fn(server)
    }
    /** @returns {[PortOpener]} */
    static all(ns) {
        return [
            PortOpener.brutessh,
            PortOpener.ftpcrack,
            PortOpener.httpworm,
            PortOpener.relaysmtp,
            PortOpener.sqlinject,
        ]
    }
    static brutessh(ns) { return new PortOpener(ns, "BruteSSH.exe", ns.brutessh) }
    static ftpcrack(ns) { return new PortOpener(ns, "FTPCrack.exe", ns.ftpcrack) }
    static httpworm(ns) { return new PortOpener(ns, "HTTPWorm.exe", ns.httpworm) }
    static relaysmtp(ns) { return new PortOpener(ns, "relaySMTP.exe", ns.relaysmtp) }
    static sqlinject(ns) { return new PortOpener(ns, "SQLInject.exe", ns.sqlinject) }
}