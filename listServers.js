import { ServerCrawler } from "serverCrawler.js"

const Info = Object.freeze({
	ignoreServersThatStartWith: "WorkerSmurf"
})

export async function main(ns) {
	const sc = new ServerCrawler(ns, async (ns, serverName, level) => {
        if (serverName.startsWith(Info.ignoreServersThatStartWith)) { return true }
		const formatter = new InfoFormatter(serverName)
		ns.tprint(formatter.formattedMessage(level))
        return true
	})
	await sc.serverLoop()
}

class InfoFormatter {
	constructor(server) {
		this.server = server
	}
	dashes(num) { return [...Array(num)].reduce(((v, _) => v + "-"), "") }
	formattedMessage(levels) {
		return this.dashes(levels) + this.server
	}
}