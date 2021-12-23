import { ServerCrawler } from "serverCrawler.js"
import * as SH from "serverHack.js"

export async function main(ns) {
	var sc = new ServerCrawler(ns, async (ns, server, level) => {
        ns.tprint(level + ":" + server)
    })
    await sc.serverLoop()
}