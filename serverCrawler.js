class ServerCrawler {
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

export { ServerCrawler }