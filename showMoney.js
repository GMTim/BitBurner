class ServerRecursion {
	constructor(ns, command) {
		this.ns = ns
		this.command = command
		this.allServers = ["home", "BabySmurf", "BigPapaSmurf"]
	}
	async serverLoop(serversList, startLevel) {
		const ns = this.ns
		let servers = serversList ?? await ns.scan()
		let level = startLevel ?? 1
		for (let server of servers) {
			if (this.allServers.includes(server) == true) { continue }
			this.allServers.push(server)
			await this.command(ns, server, level)
			await ns.sleep(500)
			let nextLevelServers = ns.scan(server)
			await this.serverLoop(nextLevelServers, level + 1)
		}
	}
}

export async function main(ns) {
    const moneyFinder = new ServerRecursion(ns, async (ns, server, level) => {
		const isRooted = ns.hasRootAccess(server)
		if (isRooted == false) { return }
		const dashes = [...Array(level)].reduce(((v, _) => v + "-"), "")
		const money = ns.getServerMoneyAvailable(server)
		const neededHackLevel = ns.getServerRequiredHackingLevel(server)
		const maxMoney = ns.getServerMaxMoney(server)
		ns.tprint(dashes + server + "(" + neededHackLevel + "): $" + money.toLocaleString() + "/$" + maxMoney.toLocaleString())
	})
	await moneyFinder.serverLoop()
}