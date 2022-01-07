import * as GNS from "./gangLibrary";

const Info = Object.freeze({
    holdBack: 40_000_000_000,
    minTerritory: 0.10,
    maxTerritory: 0.15,
})
let isGainingTerritory = false

/** @param {import(".").NS } ns */
export async function main(ns) {
    let gang = new GNS.Gang(ns)
    if (gang.power >= Info.minPower && money >= 0 && gang.territory < Info.minTerritory) {
        ns.tprint(gang.power >= Info.minPower && money >= 0 && gang.territory < Info.minTerritory)
        if (gang.territory < Info.maxTerritory || isGainingTerritory) {
            ns.tprint(gang.territory < Info.maxTerritory || isGainingTerritory)
            isGainingTerritory = true
            gang.startWar()
        } else {
            gang.stopWar()
            isGainingTerritory = false
        }
    } else {
        gang.stopWar()
        isGainingTerritory = false
    }
}

/** @param {import(".").NS } ns */
const printAllEquipment = (ns) => {
    let money = ns.getServerMoneyAvailable("home") - Info.holdBack
    ns.tprint(`Money: $${money.toLocaleString()}`)
    for (let e of GNS.Equipment.all(ns)) {
        /** @type {GNS.Equipment} */
        let equipment = e
        let canAfford = equipment.cost <= money - equipment.cost
        ns.tprint(`${equipment.name}: $${equipment.cost.toLocaleString()} - Can Afford? ${canAfford}`)
    }
}
/** @param {import(".").NS } ns */
const printAllEquipmentOnBanger = (ns, index) => {
    let banger = GNS.GangBanger.all(ns)[index]
    for (let e of banger.upgrades) {
        ns.tprint(e)
    }
    for (let e of banger.augmentations) {
        ns.tprint(e)
    }
}