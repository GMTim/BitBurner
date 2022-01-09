import { ServerCrawler } from "./serverCrawler";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let showServer = ns.args[0]
    let crawler = new ServerCrawler(ns, (n, server, level, parents) => {
        /** @type {import(".").NS } */
        let ns = n
        let s = new Server(server, parents)
        if (showServer == undefined || showServer == s.server) {
            for (let parent of parents) {
                ns.tprint(`connect ${parent}`)
            }
            ns.tprint(`connect ${s.server}`)
        }
        return true
    })
    await crawler.serverLoop()
}

class Server {
    /**
     * @param {string} server
     * @param {[string]} parents
     * */
    constructor(server, parents) {
        this.server = server
        this.parents = parents        
    }
    get list() {
        let list = ""
        for (let parent of this.parents) {
            list += parent
            list += " -> "
        }
        list += this.server
        return list
    }
}