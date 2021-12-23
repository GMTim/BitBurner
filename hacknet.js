const Info = Object.freeze({
    printPublic: false,
	holdBackAmount: 1_000_000,
})

export async function main(ns) {
    while(true) {
		let cluster = new NethackCluster(ns)
		await cluster.upgrade()
		await ns.sleep(500)
	}
}

const Attribute = Object.freeze({
	level: { steps: 12.5, name: "level" },
	ram: { steps: 4, name: "ram" },
	core: { steps: 1, name: "core" },
})

class NethackServer {
	constructor(ns, index) {
		this.ns = ns
		this.hn = ns.hacknet
		this.index = index
	}
	get stats() { return this.hn.getNodeStats(this.index) }
	get levels() { return this.stats.level }
	get ram() { return this.stats.ram }
	get cores() { return this.stats.cores }
	get needsLevels() { return 200 - this.stats.level }
	get needsRam() { return  64 - this.stats.ram }
	get needsCores() { return 16 - this.stats.cores }
	async upgradeLevel(levels) {
		await this.hn.upgradeLevel(this.index, levels)
		this.report(levels + " Level(s) Upgraded!")
	}
	async upgradeRam(ram) {
		await this.hn.upgradeRam(this.index, ram)
		this.report(ram + "GB Ram Upgraded!")
	}
	async upgradeCores(cores) {
		await this.hn.upgradeCore(this.index, cores)
		this.report(cores + "Core(s) Upgraded!")
	}
	costToUpgradeLevels(levels) {
		let useLevels = levels ?? this.needsLevels
		return this.hn.getLevelUpgradeCost(this.index, useLevels)
	}
	costToUpgradeRam(ram) { 
		let useRam = ram ?? this.needsRam
		return this.hn.getRamUpgradeCost(this.index, useRam)
	}
	costToUpgradeCores(cores) { 
		let useCores = cores ?? this.needsCores
		return this.hn.getCoreUpgradeCost(this.index, useCores)
	}
	async nextUpgrade() {
		const addUpgrader = async (attribute, upgrader, cost) => {
			attribute.upgrade = upgrader
			attribute.cost = cost
			return attribute
		}
		let upgrader
		if (this.cores * Attribute.level.steps > this.levels) {
			upgrader = await addUpgrader(Attribute.level, () => this.upgradeLevel(1), this.costToUpgradeLevels(1))
		} else if (this.cores * Attribute.ram.steps > this.ram) {
			upgrader = await addUpgrader(Attribute.ram, () => this.upgradeRam(1), this.costToUpgradeRam(1))
		} else { 
			upgrader = await addUpgrader(Attribute.core, () => this.upgradeCores(1), this.costToUpgradeCores(1))
		}
		this.report("Next Upgrade Is: " + upgrader.name + " ($" + upgrader.cost.toLocaleString() + ")")
		return upgrader
	}
	report(message) {
		const cMessage = this.stats.name + ": " + message
		if (Info.printPublic) { this.ns.tprint(cMessage) }
		else { this.ns.print(cMessage) }
	}
}
class NethackCluster {
	constructor(ns) {
		this.ns = ns
		this.hn = ns.hacknet
	}
	get nodes() { return Array(this.hn.numNodes()).fill().map((_, i) => new NethackServer(this.ns, i)) }
	get count() { return this.nodes.length }
	get cash() { return this.ns.getServerMoneyAvailable("home") }
	get holdBack() { return Info.holdBackAmount }
	get adjustedCash() { return this.cash - this.holdBack }
	get costOfNewServer() { return this.hn.getPurchaseNodeCost() }

	async upgrade() {
		for (let node of this.nodes) {
			let upgrade = await node.nextUpgrade()
			if (this.adjustedCash - upgrade.cost >= 0) {
				await upgrade.upgrade()
			} else { this.report(node.stats.name + " " + upgrade.name + " Is Too Expensive! ($" + upgrade.cost.toLocaleString() + ")") }
		}
		this.addServer()
	}
	async addServer() {
		const cost = this.costOfNewServer
		if (this.adjustedCash - cost >= 0) {
			await this.hn.purchaseNode()
			this.report("Added A Server!")
		} else { this.report("New Server Too Expensive! ($" + cost.toLocaleString() + ")") }
	}
	report(message) {
		const cMessage = "Cluser: " + message
		if (Info.printPublic) { this.ns.tprint(cMessage) }
		else { this.ns.print(cMessage) }
	}
}
