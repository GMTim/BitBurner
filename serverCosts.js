const Info = Object.freeze({
	costPerGB: 55000,
	maxLevel: 20,
})

export async function main(ns) {
    ServerCost.AllCosts.forEach((sc) => {
		ns.tprint("Level: " + sc.level + " - Ram: " + sc.ram.toLocaleString() + " - Cost: $" + sc.cost.toLocaleString())
	})
}

class ServerCost {
	constructor(level) {
		this.level = level
	}
	get ram() { return Math.pow(2, this.level) }
	get cost() { return this.ram * Info.costPerGB }
	get nextLevel() { return new ServerCost(this.level + 1) }

	static get AllCosts() { return [...Array(Info.maxLevel)].map((_, i) => new ServerCost(i + 1)) }
	static fromRam(ram) {
		const results = ServerCost.AllCosts.filter((cost) => cost.ram == ram)
		return results[0]
	}
}