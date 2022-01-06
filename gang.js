import * as GNS from "./gangLibrary";

const Info = Object.freeze({
	prefix: "Ganger",
    focus: GNS.Foci.combat,
    holdBack: 0,
    maxWanted: 5_000,
    minWanted: 2_000,
})
let isReducingCrime = false

/** @param {import(".").NS } ns */
export async function main(ns) {
    let gang = new GNS.Gang(ns)
    while(gang.inGang) {
        recruit(gang)
        for (let banger of GNS.GangBanger.all(ns)) {
            shouldAscend(gang, banger)
            assignTasks(gang, banger)
            buyEquipment(banger)
        }
        await ns.sleep(500)
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
    isReducingCrime = false
    gangBanger.setTask(GNS.Task.traffickIllegalArms(ns).name)
}
/** @param {GNS.GangBanger} gangBanger */
const buyEquipment = (gangBanger) => {
    let money = gangBanger.ns.getServerMoneyAvailable("home") - Info.holdBack
    for (let equipmentRaw of GNS.Equipment.all(gangBanger.ns)) {
        /** @type {GNS.Equipment} */
        let equipment = equipmentRaw
        if (gangBanger.hasEquipment(equipment.name)) { continue }
        if (equipment.cost <= money) {
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
    if (gangBanger.str.ascensionMultiplier < gangBanger.str.multiplier + 1) { return }
    gangBanger.ascend()
}