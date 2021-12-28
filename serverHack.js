export class Server {
    constructor(ns, server) {
        this.ns = ns
        this.server = server
    }
    get hasRootAccess() { return this.ns.hasRootAccess(this.server) }
    get portsRequired() { return this.ns.getServerNumPortsRequired(this.server) }
    get maxRam() { return this.ns.getServerMaxRam(this.server) }
    get availableMoney() { return this.ns.getServerMoneyAvailable(this.server) }
    get maxMoney() { return this.ns.getServerMaxMoney(this.server) }
    get requiredHackingLevel() { return this.ns.getServerRequiredHackingLevel(this.server) }
    get canHack() { return this.requiredHackingLevel <= this.ns.getHackingLevel() }
    get minSercurityLevel() { return this.ns.getServerMinSecurityLevel(this.server) }
    get maxSercurityLevel() { return this.ns.getServerSecurityLevel(this.server) }
    isRunningScript(script) { return this.ns.scriptRunning(script, this.server) }
    killAll() { this.ns.killall(this.server) }
    async copy(file) { await this.ns.scp(file, this.server) }
    run(script, threads, ...args) { this.ns.exec(script, this.server, threads, ...args) }
    nuke() { this.ns.nuke(this.server) }

    static home(ns) { return new Server(ns, "home") }
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
    get canNuke() { return this.server.portsRequired <= PortOpener.portsThatCanBeOpened(this.ns) }
    nuke() {
        if (this.server.hasRootAccess == true) { this.reporter.report("Already Rooted!"); return }
        if (this.canNuke == false) { this.reporter.report("Not enough ports open."); return }
        this.server.nuke()
        this.reporter.report("Nuked!")
    }
}
class HackScript {
    constructor(name) {
        this.name = name
    }
    static get Hack() { return new HackScript("hack.js") }
    static get Weaken() { return new HackScript("weaken.js") }
    static get Grow() { return new HackScript("grow.js") }
    static get allNames() { return [this.Hack.name, this.Weaken.name, this.Grow.name] }
}
export class HackInfector {
    constructor(ns, server) {
        this.ns = ns
        this.server = ns.server
        this.server = new Server(ns, server)
        this.reporter = new Reporter(ns, server)
    }
    get serverRunningScript() { return HackScript.allNames.reduce((v, n) => v || this.server.isRunningScript(n), false) }
    get serverRunningHack() { return this.server.isRunningScript(HackScript.Hack.name) }
    get serverRunningWeaken() { return this.server.isRunningScript(HackScript.Weaken.name) }
    get serverRunningGrow() { return this.server.isRunningScript(HackScript.Grow.name) }
    shouldWeaken(server) { return server.minSercurityLevel + 5 <= server.maxSercurityLevel }
    shouldGrow(server) { return server.maxMoney * 0.75 >= server.availableMoney }
    scriptRam(script) { return this.ns.getScriptRam(script) }
    threads(script) { return Math.floor(this.server.maxRam / this.scriptRam(script)) }
    async provideTask(target) {
        const targetServer = new Server(this.ns, target ?? this.server.server)
        const runAndReport = async (script) => {
            if (this.server.isRunningScript(script.name)) {
                this.reporter.report("Script Already Running - " + script.name)
                return
            }
            this.server.killAll()
            await this.infect(target, script.name)
            this.reporter.report("Running Script " + script.name)
        }
        if (this.shouldWeaken(targetServer)) { await runAndReport(HackScript.Weaken); return }
        if (this.shouldGrow(targetServer)) { await runAndReport(HackScript.Grow); return }
        await runAndReport(HackScript.Hack)
    }
    async infect(target, script) {
        if (this.threads(script) <= 0) {
            this.reporter.report("Not Enough Threads To Run Script!")
            return
        }
        this.server.killAll()
        await this.server.copy(script)
        this.server.run(script, this.threads(script), target ?? this.server.server)
        this.reporter.report(script + " is running!")
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