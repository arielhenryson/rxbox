import { RXBox } from '../index'

declare let describe
declare let beforeAll
declare let it
declare let expect


describe('RXBox', () => {
    let store

    beforeAll(() => {
        store = new RXBox()
        store.debug = true
        store.saveToSessionStorage = true
        store.saveToLocalStorage = true
    })


    it('Should assign foo value to 1 and return 1 when try to get the state', () => {
        store.assignState({ foo: 1 })
        const foo = store.getState()['foo']
        expect(foo).toBe(1)
    })


    it('Should assign value to foo and trigger the watch', done => {
        store.select('foo').subscribe(val => {
            expect(val).toBe(1)
            done()
        })


        store.assignState({ foo: 1 })
    })


    it('Should assign value to foo before select and trigger the observable', done => {
        store.assignState({ foo: 1 })


        store.select('foo').subscribe(val => {
            expect(val).toBe(1)
            done()
        })
    })


    it('Should assign value to foo before watch and NEVER trigger the observable', done => {
        store.assignState({ foo: 1 })


        store.watch('foo').subscribe(() => {
            expect(2).toBe(1) // should never run
            done()
        })

        setTimeout(() => {
            done()
        }, 2000)
    })



    it('Should assign foo2.bar (nested) value to testVal and return testVal when try to get the state', () => {
        const foo2 = {
            bar: 'testVal'
        }

        store.assignState({ foo2 })
        const res = store.getState()['foo2']['bar']
        expect(res).toBe('testVal')
    })


    it('Should assign foo2.bar (nested) value to testVal and trigger the nested watch', done => {
        store.watch('foo2.bar').subscribe(res => {
            expect(res).toBe('testVal')
            done()
        })


        const foo2 = {
            bar: 'testVal'
        }

        store.assignState({ foo2 })
    })


    it('Should net trigger the watch after assign the same value', done => {
        let index = 0
        store.watch('testKey1').subscribe(res => {
            index++

            if (index > 1) {
                // this code should net bre run if the watch is working correctly
                expect(res).toBe(2)
            }
        })


        store.assignState({
            testKey1: 'foo'
        })


        store.assignState({
            testKey1: 'foo'
        })

        done()
    })




    it('Should trigger the watch multiples time after assign multiple times', done => {
        let index = 0
        store.watch('testKey2').subscribe(res => {
            index++

            if (index > 1) {
                expect(res).toBe('foo2')
                done()
            }
        })


        store.assignState({
            testKey2: 'foo1'
        })


        store.assignState({
            testKey2: 'foo2'
        })

        done()
    })


    it('Should restore the store from localStorage and check date is ok', () => {
        const dateVal = new Date()

        store.assignState({
            dateVal
        })


        const restoredStore = store.getStoreFromLocalStorage()

        expect(dateVal.getTime()).toBe(restoredStore.dateVal.getTime())
    })


    it('Should restore the store from sessionStorage and check date is ok', () => {
        const dateVal = new Date()

        store.assignState({
            dateVal
        })


        const restoredStore = store.getStoreFromSessionStorage()

        expect(dateVal.getTime()).toBe(restoredStore.dateVal.getTime())
    })
})
