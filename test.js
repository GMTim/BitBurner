import { NSClass, ToastTypes } from "./nsLibrary";

/** @param {import(".").NS } ns */
export async function main(ns) {
    let nsc = new NSClass(ns)
    nsc.ports.port01.write("Blamo")
    nsc.messaging.alert(nsc.ports.port01.next)
}