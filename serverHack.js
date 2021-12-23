export class Server {
    constructor(ns, server) {
        this.ns = ns
        this.server = server
    }
    get hasRootAccess() { return this.ns.hasRootAccess(this.server) }
    get portsRequired() { return this.ns.getServerNumPortsRequired(this.server) }
    get maxRam() { return this.ns.getServerMaxRam(server) }
    isRunningScript(script) { return this.ns.scriptRunning(script, this.server) }
    killAll() { this.ns.killAll(this.server) }
    copy(file) { this.ns.scp(file, this.server) }
    run(script, threads, ...args) { this.ns.exec(script, this.server, threads, args) }
}
export class PortOpener {
    constructor(ns, name, command) {
        this.ns = ns
        this.name = name
        this.command = command
    }
    get exsists() { return this.ns.fileExists(this.name) }
    run(server) {
        if (this.exsists == false) { return }
        this.command(server)
    }

    static portsThatCanBeOpened(ns) {
		return PortOpener.allOpeners(ns).reduce((sum, opener) => {
			if (opener.exsists == true) { return sum + 1 }
			return sum
		}, 0)
	}
    static allOpeners(ns) {
        return [
			new PortOpener(ns, "BruteSSH.exe", ns.brutessh),
			new PortOpener(ns, "FTPCrack.exe", ns.ftpcrack),
			new PortOpener(ns, "relaySMTP.exe", ns.relaysmtp),
			new PortOpener(ns, "HTTPWorm.exe", ns.httpworm),
			new PortOpener(ns, "SQLInject.exe", ns.sqlinject),
        ]
    }
    static runAll(ns, server) {
        PortOpener.allOpeners(ns).forEach((o) => o.run(server))
    }
}
export class Nuker {
    constructor(ns, server) {
        this.ns = ns
        this.server = new Server(ns, server)
        this.reporter = new Reporter(ns, server)
    }
    get canNuke() { return this.server.portsRequired <= PortOpener.portsThatCanBeOpened(ns) }
    async nuke() {
        if (this.server.hasRootAccess == true) { this.reporter.report("Already Rooted!"); return }
        if (this.canNuke == false) { this.reporter.report("Not enough ports open."); return }
        await this.ns.nuke()
        this.reporter.report("Nuked!")
    }
}
export class HackInfector {
    constructor(ns, script, server, reinfect) {
        this.ns = ns
        this.server = ns.server
        this.script = script
        this.server = new Server(ns, server)
        this.reinfect = reinfect ?? false
        this.reporter = new Reporter(ns, server)
    }
    get scriptRam() { return this.ns.getScriptRam(this.script) }
    get threads() { return Math.floor(this.server.maxRam / this.scriptRam) }
    async infect(target) {
        if (this.threads <= 0) {
            this.reporter.report("Not Enough Threads To Run Script!")
            return
        }
        if (this.server.isRunningScript(this.script) && this.reinfect == false) {
            this.reporter.report("Script is already running! Not Reinfecting.")
            return
        }
        this.server.killAll()
        this.server.copy(this.script)
        this.server.run(this.script, this.threads, target ?? this.server.server)
        this.reporter.report(this.script + " is running!")
    }
}
export class Reporter {
    constructor(ns, prefix) {
        this.ns = ns
        this.prefix = prefix
    }
    report(message) {
        let fullMessage = this.prefix ? this.prefix + ": " : ""
        this.ns.print(fullMessage + message)
    }
}