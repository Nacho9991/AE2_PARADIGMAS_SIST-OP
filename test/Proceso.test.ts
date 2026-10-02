import {describe, test, expect, Experimental, test} from "vitest";
import {Proceso} from "../src/Proceso";

describe("Proceso", () => {
    test("Guarda el PID, la memoria requerida y el tiempo total de la CPU",() => {
        const p = new Proceso(1, 200, 5);

        expect(p.getPid()).toBe(1);
        expect(p.getMemoriaRequerida()).toBe(200);
        expect(p.getCpuTotal()).toBe(5);

    })

    test("un proceso con datos correctos es valido", () => {
        const p=new Proceso(1, 200, 5);
        expect(p.esValido()).toBe(true);
    });
});


describe("PID invalido", () => {
    test("rechaza un PID igual a 0", () => {
        expect(new Proceso(0, 200, 5).esValido()).toBe(false);
    });
    test("rechaza un PID negativo", () => {
        expect(new Proceso(-1, 200, 5).esValido()).toBe(false);
    });
    test("rechaza un PID decimal", () => {
        expect(new Proceso(1.5, 200, 5).esValido()).toBe(false);
    });
    test("rechaza un PID no numerico", () => {
        expect(new Proceso(NaN, 200, 5).esValido()).toBe(false);
    });
  });