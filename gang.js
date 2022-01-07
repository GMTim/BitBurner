import * as GNS from "./gangLibrary";

const Info = Object.freeze({
	prefix: "Ganger",
    focus: GNS.Foci.combat,
    holdBack: 0,
    maxWanted: 5_000,
    minWanted: 2_000,
    minRespect: 500_000,
    minPower: 200,
    minTerritory: 0.10,
    maxTerritory: 0.15,
})
let isReducingCrime = false
let isGainingTerritory = false
let money = 0

/** @param {import(".").NS } ns */
export async function main(ns) {
    let gang = new GNS.Gang(ns)
    while(gang.inGang) {
        recruit(gang)
        for (let banger of GNS.GangBanger.all(ns)) {
            money = ns.getServerMoneyAvailable("home") - Info.holdBack
            shouldAscend(gang, banger)
            assignTasks(gang, banger)
            buyEquipment(banger)
        }
        await ns.sleep(500)
        if (gang.power >= Info.minPower && money >= 0 && gang.territory < Info.minTerritory) {
            if (gang.territory < Info.maxTerritory || isGainingTerritory) {
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
}

/** @param {GNS.Gang} gang */
const recruit = (gang) => {
    gang.ns.print(`Can Recruite: ${gang.canRecruitMember}`)
    if (gang.canRecruitMember) { gang.recruitMember(Info.prefix) }
}
/**
 * @param {GNS.Gang} gang
 * @param {GNS.GangBanger} gangBanger */
const assignTasks = (gang, gangBanger) => {
    const ns = gang.ns
    if (gangBanger.str.score < 100) {
        if (gang.isHacking) { gangBanger.setTask(GNS.Task.trainCombat(ns).name); return }
        gangBanger.setTask(GNS.Task.trainCombat(ns).name); return
    }
    if (gang.wantedLevel > Info.minWanted) {
        if (gang.wantedLevel > Info.maxWanted || isReducingCrime) {
            gangBanger.setTask(GNS.Task.vigilanteJustice(ns).name)
            isReducingCrime = true
            return
        }
    }
    if (
        gangBanger.earnedRespect > gang.respect / 2
        || (money > 0 && gang.power < Info.minPower)
        || gang.territoryWarfareEngaged) { gangBanger.setTask(GNS.Task.territoryWarfare(ns).name); return }
    if (gang.respect < Info.minRespect) { gangBanger.setTask(GNS.Task.terrorism(ns).name); return }
    isReducingCrime = false
    gangBanger.setTask(GNS.Task.humanTrafficking(ns).name)
}
/** @param {GNS.GangBanger} gangBanger */
const buyEquipment = (gangBanger) => {
    for (let equipmentRaw of GNS.Equipment.all(gangBanger.ns)) {
        /** @type {GNS.Equipment} */
        let equipment = equipmentRaw
        if (gangBanger.hasEquipment(equipment.name) || gangBanger.hasAugmentation(equipment.name)) { continue }
        if (equipment.cost <= money - equipment.cost) {
            gangBanger.purchaseEquipment(equipment.name)
            break
        }
    }
}
/**
 * @param {GNS.Gang} gang
 * @param {GNS.GangBanger} gangBanger */
const shouldAscend = (gang, gangBanger) => {
    if (gang.respect < gangBanger.earnedRespect * 2) { return }
    if (gangBanger.ascensionStr < gangBanger.str.ascensionMultiplier + 1) { return }
    gangBanger.ascend()
}