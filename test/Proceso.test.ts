import { describe, test, expect} from "vitest"
import { Proceso } from "../src/Proceso"
import {EstadodeProceso} from "../src/EstadodeProceso"

describe("Proceso", () => {
    test("verifica el PID, la memoria requerida y el tiempo total de cpu", () => {
        const p = new Proceso(1, 200,5);
        expect(p.getPid()).toBe(1);
        expect(p.getMemoriaRequerida()).toBe(200)
        expect(p.getCpuTotal()).toBe                            
    });
    test("si hago proceso con datos corretos es valido",()=>{
        const p=new Proceso(1, 200, 5);
        expect(p.esValido()).toBe(true);
    });
});

describe("PID invalido", () => {
    test("un PID igual a 0 no es valido", ()=>{
        expect(new Proceso(0, 200, 5).esValido()).toBe(false);
    });
    test("un PID negativo no es valido", ()=>{
        expect(new Proceso(-9, 200, 5).esValido()).toBe(false);
    });
    test("un PID decimal no es valido", ()=>{
        expect(new Proceso(3.3, 200, 5).esValido()).toBe(false);
    });
    test("un PID que no sea un numero no es valido", ()=>{
        expect(new Proceso(NaN, 200, 5).esValido()).toBe(false);
    });
});

describe("memoria requerida invalida", () => {
    test("Una memoria que sea igual a 0 no es valida", ()=>{
        expect(new Proceso(1, 0, 5).esValido()).toBe(false);
    });
    test("una memoria que sea igual a negativa no es valido", ()=>{
        expect(new Proceso(1, -9, 5).esValido()).toBe(false);
    });
    test("una meoria que sea decimal no es valido", ()=>{
        expect(new Proceso(1, -3.3, 5).esValido()).toBe(false);
    });
    test("una memoria que no sea un numero no es valido", ()=>{
        expect(new Proceso(1, NaN, 5).esValido()).toBe(false);
    });
});

