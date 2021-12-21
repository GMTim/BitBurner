const Info = {
	moneyScript: "getMoney.js",
	startServers: ["home", "BabySmurf", "BigPapaSmurf"],
	shouldReinfect: true,
	infectionTarget: "omega-net",
}
class AllOpeners {
	constructor(ns) {
		this.ns = ns
		this.openers = [
			new PortOpener(ns, "BruteSSH.exe", ns.brutessh),
			new PortOpener(ns, "FTPCrack.exe", ns.ftpcrack),
			new PortOpener(ns, "relaySMTP.exe", ns.relaysmtp),
			new PortOpener(ns, "HTTPWorm.exe", ns.httpworm),
			new PortOpener(ns, "SQLInject.exe", ns.sqlinject),
		]
	}
	get portsThatCanBeOpened() {
		return this.openers.reduce((sum, opener) => {
			if (opener.exsists == true) { return sum + 1 }
			return sum
		}, 0)
	}
	openAll(server) {
		this.openers.forEach((opener) => opener.run(server))
	}
}
class PortOpener {
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
}

class Infector {
	constructor(ns, server) {
		this.ns = ns
		this.server = server
		this.portHandler = new AllOpeners(ns)
	}
	async compimiseServer() {
		const ns = this.ns
		const server = this.server
		await this.openPorts()
		if (await this.nuke() == false) { return }
		await this.getMoney()
	}
	async openPorts() {
		const server = this.server
		this.portHandler.openAll(server)
	}
	async nuke() {
		const ns = this.ns
		const server = this.server
		if (ns.hasRootAccess(server)) { return true }
		if (ns.getServerNumPortsRequired(server) > this.portHandler.portsThatCanBeOpened) {
			this.report("Too Many Ports!")
			return false
		}
		await ns.nuke(server)
		this.report("Nuked!")
		return true
	}
	async getMoney() {
		const ns = this.ns
		const server = this.server
		if (Info.shouldReinfect == false && ns.scriptRunning(Info.moneyScript, server)) {
			return
		}
		let threads = this.figureThreads()
		if (threads <= 0) {
			this.report("Not Enough Ram")
			return
		}
		ns.killall(server)
		await ns.scp(Info.moneyScript, "home", server)
		this.report("Money Script Copied")
		ns.exec(Info.moneyScript, server, threads, Info.infectionTarget ?? server)
		this.report("Money Script Started")
	}
	figureThreads() {
		const ns = this.ns
		const server = this.server
		let neededMem = ns.getScriptRam(Info.moneyScript)
		let serverMem = ns.getServerMaxRam(server)
		return Math.floor(serverMem / neededMem)
	}
	report(message) {
		this.ns.print(this.server + ": " + message)
	}
}

class ServerRecursion {
	constructor(ns) {
		this.ns = ns
		this.allServers = Info.startServers
	}
	async serverLoop(serversList) {
		const ns = this.ns
		let servers = serversList ?? await ns.scan()
		for (let server of servers) {
			if (this.allServers.includes(server) == true) { continue }
			this.allServers.push(server)
			let infector = new Infector(ns, server)
			await infector.compimiseServer()
			let nextLevelServers = ns.scan(server)
			await ns.sleep(1000)
			await this.serverLoop(nextLevelServers)
		}
	}
}

/** @param {NS} ns **/
export async function main(ns) {
	const loops = ns.args[0] ?? 1^20
	let count = 0
	while(count < loops) {
		count++
		let sr = new ServerRecursion(ns)
		await sr.serverLoop()
		await ns.sleep(30000)
	}
}