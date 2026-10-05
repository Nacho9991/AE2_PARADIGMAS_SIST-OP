import {describe, test, expect} from "vitest"
import {GestorMemoria} from "../src/GestorMemoria"

describe("GestorMemoria", () => {
    test("Inicia como bloque libre que abarca toda la memoria", ()=>{
        const gestor = new GestorMemoria (1024);
        
        expect(gestor.getMemoriaTotal()).toBe(1024);
        expect(gestor.getBloques()).toHaveLength(1);

        const bloqueInicial = gestor.getBloques()[0];
         expect(bloqueInicial.getInicio()).toBe(0);
         expect(bloqueInicial.getTamanio()).toBe(1024);
         expect(bloqueInicial.estaLibre()).toBe(true);
    })

    test("asigna un bloque exacto a un proceso", ()=>{
        const gestor = new GestorMemoria (1024);
        const asignado = gestor.asignar(1, 1024);
        
        expect(asignado).toBe(true);
        expect(gestor.getBloques()).toHaveLength(1);
        expect(gestor.getBloques()[0].estaLibre()).toBe(false);
        expect(gestor.getBloques()[0].getPidAsignado()).toBe(1);
    })

    test("divide un bloque libre cuando el proceso requiere menor tamanio", ()=>{
        const gestor = new GestorMemoria (1024);
        const asignado = gestor.asignar(1, 256);
        
        expect(asignado).toBe(true);
        expect(gestor.getBloques()).toHaveLength(2);

        const bloqueOcupado = gestor.getBloques()[0]
        expect(bloqueOcupado.getInicio()).toBe(0);
        expect(bloqueOcupado.getTamanio()).toBe(256);
        expect(bloqueOcupado.getPidAsignado()).toBe(1);

        const bloqueoRestante = gestor.getBloques()[1]
        expect(bloqueoRestante.getInicio()).toBe(256);
        expect(bloqueoRestante.getTamanio()).toBe(768);
        expect(bloqueoRestante.estaLibre()).toBe(true);
    })

    test("retorna falso si ningun bloque libre tiene espacio contiguo", ()=>{
        const gestor = new GestorMemoria (256);
        const asignado = gestor.asignar(1, 512);

        expect(asignado).toBe(false)
        expect(gestor.getBloques()).toHaveLength(1)
        expect(gestor.getBloques()[0].estaLibre()).toBe(true)
        
        
    })

    test("libera un bloque ocupado dejando el espacio disponible", ()=>{
        const gestor = new GestorMemoria (1024)
        gestor.asignar(1, 256)
        gestor.liberar(1)
    
        expect(gestor.getBloques()).toHaveLength(1);
        expect(gestor.getBloques()[0].estaLibre()).toBe(true);
        expect(gestor.getBloques()[0].getTamanio()).toBe(1024);
    })

    test("fusiona bloques contiguos al liberar en el medio de otros libres", ()=>{
        const gestor = new GestorMemoria (1000);
        gestor.asignar(1, 200)
        gestor.asignar(2, 300)
        gestor.asignar(3, 500)

        gestor.liberar(2)
        expect(gestor.getBloques()).toHaveLength(3)
        expect(gestor.getBloques()[1].estaLibre()).toBe(true)

        gestor.liberar(1)
        expect(gestor.getBloques()).toHaveLength(2)
        expect(gestor.getBloques()[0].getTamanio()).toBe(500)
        expect(gestor.getBloques()[0].estaLibre()).toBe(true)

        gestor.liberar(3)
        expect(gestor.getBloques()).toHaveLength(1)
        expect(gestor.getBloques()[0].getTamanio()).toBe(1000)
        expect(gestor.getBloques()[0].estaLibre()).toBe(true)


    })

    test("no realiza cambios si se intenta liberar un  PID inexistente", ()=>{
        const gestor = new GestorMemoria (1024);
        gestor.asignar(1, 256)
        gestor.asignar(999)

        expect(gestor.getBloques()).toHaveLength(2)
        expect(gestor.getBloques()[0].getPidAsignado()).toBe(1)


    })

    describe("Metricas de memoria (IConsultaMemoria)", () => {
        test("calcula correctamente memoria libre, mayor bloque y memoria ocupada", () => {
            const gestor = new GestorMemoria(1000)
            
            expect(gestor.getMemoriaLibreTotal()).toBe(1000)
            expect(gestor.getMayorBloqueLibre()).toBe(1000)
            expect(gestor.getMemoriaOcupada()).toBe(0)

            gestor.asignar(1, 300)
            gestor.asignar(2, 400)

            expect(gestor.getMemoriaOcupada()).toBe(700)
            expect(gestor.getMemoriaLibreTotal()).toBe(300)
            expect(gestor.getMayorBloqueLibre()).toBe(300)

            gestor.liberar(1)
            expect(gestor.getMemoriaOcupada()).toBe(400)
            expect(gestor.getMemoriaLibreTotal()).toBe(600)
            expect(gestor.getMayorBloqueLibre()).toBe(300)
        })
    })

    describe("Fragmentacion externa", () => {
        test("es 0 cuando la memoria está completamente libre", () => {
            const gestor = new GestorMemoria(1000);

            expect(gestor.getMemoriaLibreTotal()).toBe(1000)
            expect(gestor.getMayorBloqueLibre()).toBe(1000)
            expect(gestor.getFragmentacionExterna()).toBe(0)
        });

        test("calcula la memoria libre no contigua cuando hay fragmentación", () => {
            const gestor = new GestorMemoria(1000)
            gestor.asignar(1, 200)
            gestor.asignar(2, 100)
            gestor.asignar(3, 400)

            gestor.liberar(2)
            expect(gestor.getMemoriaLibreTotal()).toBe(400)
            expect(gestor.getMayorBloqueLibre()).toBe(300)
            expect(gestor.getFragmentacionExterna()).toBe(100)
        })

        test("es 0 cuando la memoria está totalmente ocupada", () => {
            const gestor = new GestorMemoria(500)
            gestor.asignar(1, 500)

            expect(gestor.getMemoriaLibreTotal()).toBe(0)
            expect(gestor.getMayorBloqueLibre()).toBe(0)
            expect(gestor.getFragmentacionExterna()).toBe(0)
        })
    })
})