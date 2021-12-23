import { ServerCrawler } from "serverCrawler.js"
import * as SH from "serverHack.js"

const Info = Object.freeze({
    moneyScript: "getMoney.js",
	shouldReinfect: false,
	infectionTarget: "omega-net",
    loops: null
})

export async function main(ns) {
    let count = 0
    while(Info.loops === null || count < Info.loops) {
        if (Info.loops !== null) { count++ }
        const sc = new ServerCrawler(ns, async (ns, server, _) => {
            SH.PortOpener.runAll(ns, server)
            new SH.Nuker(ns, server).nuke()
            await new SH.HackInfector(ns, server, Info.moneyScript).infect(Info.infectionTarget, Info.shouldReinfect)
        })
        await sc.serverLoop()
    }
}