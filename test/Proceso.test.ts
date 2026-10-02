import {describe, it, expect, Experimental} from "vitest";
import {Proceso} from "../src/Proceso";

describe("Proceso", () => {
    it("Guarda el PID, la memoria requerida y el tiempo total de la CPU",() => {
        const p = new Proceso(1, 200, 5);

        expect(p.getPid()).toBe(1);
        expect(p.getMemoriaRequerida()).toBe(200);
        expect(p.getCpuTotal()).toBe(5);

    })
})