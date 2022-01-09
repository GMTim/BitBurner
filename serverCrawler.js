class ServerCrawler {
	constructor(ns, command) {
		this.ns = ns
		this.command = command
		this.allServers = ["home", "BabySmurf", "BigPapaSmurf"]
	}
	async serverLoop(serversList, startLevel, parentList) {
		const ns = this.ns
		let parents = parentList ?? ["home"]
		let servers = serversList ?? await ns.scan()
		let level = startLevel ?? 1
		for (let server of servers) {
			if (this.allServers.includes(server) == true) { continue }
			this.allServers.push(server)
			const shouldSkipWait = await this.command(ns, server, level, parents)
			if (await shouldSkipWait !== true) { await ns.sleep(500) }
			let nextLevelServers = ns.scan(server)
			let nextParents = JSON.parse(JSON.stringify(parents))
			nextParents.push(server)
			await this.serverLoop(nextLevelServers, level + 1, nextParents)
		}
	}
}

export { ServerCrawler }