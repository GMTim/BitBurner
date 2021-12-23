import { ServerCrawler } from "serverCrawler.js"
import { Server } from "serverHack.js"

const Info = Object.freeze({
	ignoreServersThatStartWith: "WorkerSmurf"
})

export async function main(ns) {
	const sc = new ServerCrawler(ns, async (ns, serverName, level) => {
		if (serverName.startsWith(Info.ignoreServersThatStartWith)) { return true }
		const server = new Server(ns, serverName)
		if (server.hasRootAccess == false || server.canHack == false) { return true }
		const formatter = new InfoFormatter(server)
		ns.tprint(formatter.formattedMessage(level))
	})
	await sc.serverLoop()
}

class InfoFormatter {
	constructor(server) {
		this.server = server
	}
	get money() { return "$" + this.server.availableMoney.toLocaleString() }
	get maxMoney() { return "$" + this.server.maxMoney.toLocaleString() }
	dashes(num) { return [...Array(num)].reduce(((v, _) => v + "-"), "") }
	formattedMessage(levels) {
		return this.dashes(levels) + this.server.server +
			"(" + this.server.requiredHackingLevel + "): " + this.money + "/" + this.maxMoney
	}
}