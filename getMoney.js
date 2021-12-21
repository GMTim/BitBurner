/** @param {NS} ns **/
export async function main(ns) {
    var server = ns.args[0]
	var shouldGrowNumber = ns.getServerMaxMoney(server) * 0.75
	var shouldWeakenNumber = ns.getServerMinSecurityLevel(server) + 5

	while(true) {
		if (shouldWeakenNumber <= ns.getServerSecurityLevel(server)) {
			ns.print("Going to Weaken Server")
			await ns.weaken(server)
		} else if (shouldGrowNumber >= ns.getServerMoneyAvailable(server)) {
			ns.print("Going to Grow Server")
			await ns.grow(server)
		} else if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(server)) {
			ns.print("Going to Hack Server")
			await ns.hack(server)
		}
		await ns.sleep(1000)
	}
}