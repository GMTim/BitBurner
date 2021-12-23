const Info = Object.freeze({
	costPerGB: 55000,
	prefixName: "WorkerSmurf-",
	maxLevel: 20,
	maxServers: 25,
	startLevel: 2,
})

export async function main(ns) {
	var currentServerLevel = 0
	while (currentServerLevel < 20) {
		var serversMatchingCurrent = 0
		for (let server of Server.AllServers(ns)) {
			if (server.levelVal != currentServerLevel) { continue }
			serversMatchingCurrent++
			server.buyUpgrade()
			await ns.sleep(500)
		}
		if (serversMatchingCurrent == 0) {
			currentServerLevel++
			ns.print("Increasing Current Level To: " + currentServerLevel)
		}
	}
	ns.print("All Servers Maxed!")
}
class ServerCost {
	constructor(level) {
		this.level = level
	}
	get ram() { return Math.pow(2, this.level) }
	get cost() { return this.ram * Info.costPerGB }
	get nextLevel() { return new ServerCost(this.level + 1) }

	static get AllCosts() { return [...Array(Info.maxLevel)].map((_, i) => new ServerCost(i + 1)) }
	static fromRam(ram) {
		const results = ServerCost.AllCosts.filter((cost) => cost.ram == ram)
		return results[0]
	}
}

class Server {
	constructor(ns, index) {
		this.ns = ns
		this.index = index
	}
	get name() { return Info.prefixName + this.index }
	get exsists() { return this.ns.serverExists(this.name) }
	get ram() {
		if (this.exsists) { return this.ns.getServerMaxRam(this.name) }
		return 0
	}
	get level() { return ServerCost.fromRam(this.ram) }
	get levelVal() { return this.level?.level ?? 0 }
	get nextLevel() { return this.level?.nextLevel ?? ServerCost.AllCosts[Info.startLevel - 1] }
	get costOfUpgrade() { return this.nextLevel.cost }
	get isMaxed() { return this.levelVal == Info.maxLevel }

	buyUpgrade() {
		const ns = this.ns
		if (this.isMaxed) { return }
		if (ns.getServerMoneyAvailable("home") >= this.costOfUpgrade) {
			const ram = this.nextLevel.ram
			if (this.exsists) {
				ns.killall(this.name)
				ns.deleteServer(this.name)
			}
			if (ns.purchaseServer(this.name, ram)) {
				this.report("Baught " + this.level.level)
			} else { this.report("Failed to buy " + this.nextLevel.level) }
		} else { this.report(this.nextLevel.level + " is too expensive!") }
	}
	report(message) {
		this.ns.print(this.name + ": " + message)
	}

	static AllServers(ns) {
		let servers = [...Array(Info.maxServers)].map((_, i) => new Server(ns, i))
		return servers
	}
}