/** Gangs */
export class Gang {
    /** @param {import(".").NS } ns */
    constructor(ns) {
        this.ns = ns
        this.gang = ns.gang
        this.name = name
    }
    /** Properties */
    get canRecruitMember() { return this.gang.canRecruitMember() }
    get bonusTime() { return this.gang.getBonusTime() }
    get information() { return this.gang.getGangInformation() }
    get faction() { return this.information.faction }
    get isHacking() { return this.information.isHacking }
    get moneyGainRate() { return this.information.moneyGainRate }
    get power() { return this.information.power }
    get respect() { return this.information.respect }
    get respectGainRate() { return this.information.respectGainRate }
    get territory() { return this.information.territory }
    get territoryClashChance() { return this.information.territoryClashChance }
    get territoryWarfareEngaged() { return this.information.territoryWarfareEngaged }
    get wantedLevel() { return this.information.wantedLevel }
    get wantedLevelGainRate() { return this.information.wantedLevelGainRate }
    get wantedPenalty() { return this.information.wantedPenalty }
    get otherGangInformation() { return this.gang.getOtherGangInformation() }
    get tasks() { return Task.all(this.ns) }
    get inGang() { return this.gang.inGang() }
    /** Functions */
    changeToWinClash(gangName) { return this.gang.getChanceToWinClash(gangName) }
    recruitMember(name) { return this.gang.recruitMember(`${name}-${GangBanger.all(this.ns).length}`) }
}
export class GangBanger {
    /** @param {import(".").NS } ns */
    constructor(ns, name) {
        this.ns = ns
        this.gang = ns.gang
        this.name = name
    }
    /** Properties */
    get ascensionResult() { return this.gang.getAscensionResult(this.name) }
    get stats() { return GangMemeberStat.all(this.gang.getMemberInformation(this.name)) }
    get agi() { return this.stats.filter((s) => s.name == "agi")[0] }
    get cha() { return this.stats.filter((s) => s.name == "cha")[0] }
    get def() { return this.stats.filter((s) => s.name == "def")[0] }
    get dex() { return this.stats.filter((s) => s.name == "dex")[0] }
    get hack() { return this.stats.filter((s) => s.name == "hack")[0] }
    get str() { return this.stats.filter((s) => s.name == "str")[0] }
    get augmentations() { return this.stats.augmentations }
    get earnedRespect() { return this.stats.earnedRespect }
    get moneyGain() { return this.stats.moneyGain }
    get respectGain() { return this.stats.respectGain }
    get task() { return this.stats.task }
    get upgrades() { return this.stats.upgrades }
    get wantedLevelGain() { return this.stats.wantedLevelGain }
    /** Functions */
    ascend() { return this.gang.ascendMember(this.name) }
    purchaseEquipment(equipment) { return this.gang.purchaseEquipment(this.name, equipment) }
    setTask(task) { return this.gang.setMemberTask(this.name, task) }
    startWar() { this.setWar(true) }
    stopWar() { this.setWar(false) }
    setWar(engage) { this.setTerritoryWarfare(engage) }
    hasEquipment(equipment) { return this.upgrades.includes(equipment) }
    /** Static Functions */
    /** @param {import(".").NS } ns */
    static all(ns) { return ns.gang.getMemberNames().map((m) => new GangBanger(ns, m)) }
}
export class Equipment {
    /** @param {import(".").NS } ns */
    constructor(ns, name) {
        this.ns = ns
        this.gang = ns.gang
        this.name = name
    }
    /** Properties */
    get cost() { return this.gang.getEquipmentCost(this.name) }
    get stats() { return this.gang.getEquipmentStats(this.name) }
    get agi() { return this.stats.agi }
    get cha() { return this.stats.cha }
    get def() { return this.stats.def }
    get dex() { return this.stats.dex }
    get hack() { return this.stats.hack }
    get str() { return this.stats.str }
    /** Functions */
    purchaseEquipment(bangerName) { return new GangBanger(this.ns, bangerName).purchaseEquipment(this.name) }
    /** Static Functions */
    /**
     * @param {import(".").NS } ns 
     * @return {[Equipment]} */
    static all(ns) { return ns.gang.getEquipmentNames().map((e) => new Equipment(ns, e)) }
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
    get taskStats() { return this.gang.getTaskStats(this.name) }
    get agiWeight() { return this.taskStats.agiWeight }
    get baseMoney() { return this.taskStats.baseMoney }
    get baseRespect() { return this.taskStats.baseRespect }
    get baseWanted() { return this.taskStats.baseWanted }
    get chaWeight() { return this.taskStats.chaWeight }
    get defWeight() { return this.taskStats.defWeight }
    get desc() { return this.taskStats.desc }
    get dexWeight() { return this.taskStats.dexWeight }
    get difficulty() { return this.taskStats.difficulty }
    get hackWeight() { return this.taskStats.hackWeight }
    get isCombat() { return this.taskStats.isCombat }
    get isHacking() { return this.taskStats.isHacking }
    get strWeight() { return this.taskStats.strWeight }
    get territory() { return this.taskStats.territory }
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
    static humanTrafficking(ns) { return new Task(ns, "Human Trafficking") }
    static terrorism(ns) { return new Task(ns, "Terrorism") }
    static vigilanteJustice(ns) { return new Task(ns, "Vigilante Justice") }
    static trainCombat(ns) { return new Task(ns, "Train Combat") }
    static trainHacking(ns) { return new Task(ns, "Train Hacking") }
    static trainCharisma(ns) { return new Task(ns, "Train Charisma") }
    static territoryWarfare(ns) { return new Task(ns, "Territory Warfare") }
}
export const Foci = Object.freeze({
    combat: "Combat",
    hacking: "Hacking",
    none: "None",
})