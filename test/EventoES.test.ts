import {describe, test, expect} from "vitest"
import {EventoES} from "../src/EventoES"

describe("EventoES", () => {
    test("inicializa correctamente y expone sus atributos mediante getters", ()=>{
        const evento = new EventoES (2, 3);
        
        expect(evento.getTicksCpuParaDisparo()).toBe(2);
        expect(evento.getDuracion()).toBe(3)
    })
})