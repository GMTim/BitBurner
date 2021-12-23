export async function main(ns) {
	const home = "home"
    const script = Script.from(ns.args[0])
    if (script == null) { return } 
    if (ns.scriptRunning(script.name, home)) {
		ns.kill(script.name, home)
	}
	ns.exec(script.name, home, 1)
}

class Script {
    constructor(abbr, name) {
        this.abbr = abbr
        this.name = name
    }

    static get all() { 
        return [
            new Script("hn", "hacknet.js"),
            new Script("sb", "serverBuyer.js"),
            new Script("ha", "hackAll.js"),
        ]
    }
    static from(abbr) { return Script.all.filter((s) => s.abbr == abbr)[0] }
}