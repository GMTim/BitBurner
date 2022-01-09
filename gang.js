export const Foci = Object.freeze({
    combat: "Combat",
    hacking: "Hacking",
    none: "None",
})
const Info = Object.freeze({
	prefix: "Ganger",
    focus: Foci.combat,
    holdBack: 0,
    maxWanted: 5_000,
    minWanted: 2_000,
    minRespect: 500_000,
    minPower: 200,
    minTerritory: 0.10,
    maxTerritory: 0.15,
    faction: "Slum Snakes",
})
let isReducingCrime = false
let isGainingTerritory = false
let money = 0

/** @param {import(".").NS } ns */
export async function main(ns) {
    let gang = new Gang(ns)
    gang.createGang(Info.faction)
    while(gang.inGang) {
        recruit(gang)
        for (let banger of GangBanger.all(ns)) {
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

/** @param {Gang} gang */
const recruit = (gang) => {
    gang.ns.print(`Can Recruite: ${gang.canRecruitMember}`)
    if (gang.canRecruitMember) { gang.recruitMember(Info.prefix) }
}
/**
 * @param {Gang} gang
 * @param {GangBanger} gangBanger */
const assignTasks = (gang, gangBanger) => {
    const ns = gang.ns
    if (gangBanger.str.score < 100) {
        if (gang.isHacking) { gangBanger.setTask(Task.trainCombat(ns).name); return }
        gangBanger.setTask(Task.trainCombat(ns).name); return
    }
    if (gang.wantedLevel > Info.minWanted) {
        if (gang.wantedLevel > Info.maxWanted || isReducingCrime) {
            gangBanger.setTask(Task.vigilanteJustice(ns).name)
            isReducingCrime = true
            return
        }
    }
    if (
        gangBanger.earnedRespect > gang.respect / 2
        || (money > 0 && gang.power < Info.minPower)
        || gang.territoryWarfareEngaged) { gangBanger.setTask(Task.territoryWarfare(ns).name); return }
    if (gang.respect < Info.minRespect) { gangBanger.setTask(Task.terrorism(ns).name); return }
    isReducingCrime = false
    gangBanger.setTask(Task.humanTrafficking(ns).name)
}
/** @param {GangBanger} gangBanger */
const buyEquipment = (gangBanger) => {
    for (let equipmentRaw of Equipment.all(gangBanger.ns)) {
        /** @type {Equipment} */
        let equipment = equipmentRaw
        if (gangBanger.hasEquipment(equipment.name) || gangBanger.hasAugmentation(equipment.name)) { continue }
        if (equipment.cost <= money - equipment.cost) {
            gangBanger.purchaseEquipment(equipment.name)
            break
        }
    }
}
/**
 * @param {Gang} gang
 * @param {GangBanger} gangBanger */
const shouldAscend = (gang, gangBanger) => {
    if (gang.respect < gangBanger.earnedRespect * 2) { return }
    if (gangBanger.ascensionStr < gangBanger.str.ascensionMultiplier + 1) { return }
    gangBanger.ascend()
}

/** Gangs */
export class Gang {
    /** @param {import(".").NS } ns */
    constructor(ns) {
        this.ns = ns
        this.gang = ns.gang
        this.name = name
    }
    /** Properties */
    get canRecruitMember() { return this.gang.canRecruitMember() } //
    get information() { return this.gang.getGangInformation() } //
    get isHacking() { return this.information.isHacking } //
    get power() { return this.information.power } //
    get respect() { return this.information.respect } //
    get territory() { return this.information.territory } //
    get territoryWarfareEngaged() { return this.information.territoryWarfareEngaged } //
    get wantedLevel() { return this.information.wantedLevel } //
    get inGang() { return this.gang.inGang() } //
    /** Functions */
    recruitMember(name) { return this.gang.recruitMember(`${name}-${GangBanger.all(this.ns).length}`) } //
    startWar() { this.setWar(true) } //
    stopWar() { this.setWar(false) } //
    setWar(engage) { this.gang.setTerritoryWarfare(engage) } //
    createGang(faction) { this.gang.createGang(faction) }
}
export class GangBanger {
    /** @param {import(".").NS } ns */
    constructor(ns, name) {
        this.ns = ns
        this.gang = ns.gang
        this.name = name
    }
    /** Properties */
    get ascensionResult() { return this.gang.getAscensionResult(this.name) } //
    get stats() { return GangMemeberStat.all(this.gang.getMemberInformation(this.name)) } //
    get str() { return this.stats.filter((s) => s.name == "str")[0] } //
    get ascensionStr() { return this.str.ascensionMultiplier * (this.ascensionResult?.str ?? 0) } //
    get augmentations() { return this.stats.augmentations } //
    get earnedRespect() { return this.stats.earnedRespect } //
    /** Functions */
    ascend() { return this.gang.ascendMember(this.name) } //
    purchaseEquipment(equipment) { return this.gang.purchaseEquipment(this.name, equipment) } //
    setTask(task) { //
        if (this.task == task) { return true }
        return this.gang.setMemberTask(this.name, task)
    }
    hasEquipment(equipment) { return this.upgrades.includes(equipment) } //
    hasAugmentation(augmentation) { return this.augmentations.includes(augmentation) } //
    /** Static Functions */
    /** @param {import(".").NS } ns */
    static all(ns) { return ns.gang.getMemberNames().map((m) => new GangBanger(ns, m)) } //
}
export class Equipment {
    /** @param {import(".").NS } ns */
    constructor(ns, name) {
        this.ns = ns
        this.gang = ns.gang
        this.name = name
    }
    /** Properties */
    get cost() { return this.gang.getEquipmentCost(this.name) } //
    /** Static Functions */
    /**
     * @param {import(".").NS } ns 
     * @return {[Equipment]} */
    static all(ns) { //
        let all = ns.gang.getEquipmentNames().map((e) => new Equipment(ns, e))
        all.sort((a, b) => { return a.cost - b.cost })
        return all
    }
}
export class GangMemeberStat {
    constructor(score, ascensionMultiplier, ascensionXP, xp, multiplier, name) {
        this.score = score
        this.ascensionMultiplier = ascensionMultiplier
        this.ascensionXP = ascensionXP
        this.xp = xp
        this.multiplier = multiplier
        this.name = name
    }
    /** Static Functions */
    /** @param {import(".").GangMemberInfo } stats */
    static all(stats) {
        let all = []
        all.push(new GangMemeberStat(
            stats.agi, stats.agi_asc_mult,
            stats.agi_asc_points, stats.agi_exp,
            stats.agi_mult, "agi"))
        all.push(new GangMemeberStat(
            stats.cha, stats.cha_asc_mult,
            stats.cha_asc_points, stats.cha_exp,
            stats.cha_mult, "cha"))
        all.push(new GangMemeberStat(
            stats.def, stats.def_asc_mult,
            stats.def_asc_points, stats.def_exp,
            stats.def_mult, "def"))
        all.push(new GangMemeberStat(
            stats.hack, stats.hack_asc_mult,
            stats.hack_asc_points, stats.hack_exp,
            stats.hack_mult, "hack"))
        all.push(new GangMemeberStat(
            stats.str, stats.str_asc_mult,
            stats.str_asc_points, stats.str_exp,
            stats.str_mult, "str"))
        all.augmentations = stats.augmentations
        all.earnedRespect = stats.earnedRespect
        all.moneyGain = stats.moneyGain
        all.name = stats.name
        all.respectGain = stats.respectGain
        all.task = stats.task
        all.upgrades = stats.upgrades
        all.wantedLevelGain = stats.wantedLevelGain
        return all
    }
}
export class Task {
    /** @param {import(".").NS } ns */
    constructor(ns, name) {
        this.ns = ns
        this.gang = ns.gang
        this.name = name
    }
    /** Properties */
    /** Static Functions */
    /** @param {import(".").GangMemberInfo } stats */
    static all(ns) { return ns.gang.getTaskNames().map((t) => new Task(ns, t)) }
    static unassigned(ns) { return new Task(ns, "Unassigned") }
    static mugPeople(ns) { return new Task(ns, "Mug People") }
    static dealDrugs(ns) { return new Task(ns, "Deal Drugs") }
    static strongarmCivilians(ns) { return new Task(ns, "Strongarm Civilians") }
    static runACon(ns) { return new Task(ns, "Run a Con") }
    static armedRobbery(ns) { return new Task(ns, "Armed Robbery") }
    static traffickIllegalArms(ns) { return new Task(ns, "Traffick Illegal Arms") }
    static threatenBlackmail(ns) { return new Task(ns, "Threaten & Blackmail") }
    static humanTrafficking(ns) { return new Task(ns, "Human Trafficking") } //
    static terrorism(ns) { return new Task(ns, "Terrorism") } //
    static vigilanteJustice(ns) { return new Task(ns, "Vigilante Justice") } //
    static trainCombat(ns) { return new Task(ns, "Train Combat") } //
    static trainHacking(ns) { return new Task(ns, "Train Hacking") }
    static trainCharisma(ns) { return new Task(ns, "Train Charisma") }
    static territoryWarfare(ns) { return new Task(ns, "Territory Warfare") } //
}