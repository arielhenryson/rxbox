import { RXBox } from '../index'

describe('RXBox', () => {
    let store
    let subs = []

    beforeAll(() => {
        store = new RXBox()
        store.debug = true
        store.saveToSessionStorage = true
        store.saveToLocalStorage = true
    })

    afterEach(() => {
        subs.forEach(sub => {
            sub.unsubscribe()
        })
    })


    it('Should assign foo value to 1 and return 1 when try to get the state', () => {
        store.assignState({ foo: 1 })
        const foo = store.getState()['foo']
        expect(foo).toBe(1)
    })


    it('Should assign value to foo and trigger the watch', done => {
        const sub = store.select('foo').subscribe(val => {
            expect(val).toBe(1)
            done()
        })

        subs.push(sub)


        store.assignState({ foo: 1 })
    })


    it('Should assign value to foo before select and trigger the observable', done => {
        store.assignState({ foo: 1 })


        const sub = store.select('foo').subscribe(val => {
            expect(val).toBe(1)
            done()
        })

        subs.push(sub)
    })


    it('Should assign value to foo before watch and NEVER trigger the observable', done => {
        store.assignState({ foo: 1 })


        const sub = store.watch('foo').subscribe(() => {
            expect(2).toBe(1) // should never run
            done()
        })

        subs.push(sub)

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
        const sub = store.watch('foo2.bar').subscribe(res => {
            expect(res).toBe('testVal')
            done()
        })

        subs.push(sub)

        const foo2 = {
            bar: 'testVal'
        }

        store.assignState({ foo2 })
    })


    it('Should net trigger the watch after assign the same value', done => {
        let index = 0
        const sub = store.watch('testKey1').subscribe(res => {
            index++

            if (index > 1) {
                // this code should net bre run if the watch is working correctly
                expect(res).toBe(2)
            }
        })

        subs.push(sub)

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
        const sub = store.watch('testKey2').subscribe(res => {
            index++

            if (index > 1) {
                expect(res).toBe('foo2')
                done()
            }
        })

        subs.push(sub)

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

        expect(
          dateVal.getTime()
        ).toBe(
          restoredStore.dateVal.getTime()
        )
    })


    it('Should restore the store from sessionStorage and check date is ok', () => {
        const dateVal = new Date()

        store.assignState({
            dateVal
        })


        const restoredStore = store.getStoreFromSessionStorage()

        expect(
          dateVal.getTime()
        ).toBe(
          restoredStore.dateVal.getTime()
        )
    })


    it('Should run 2 subscribers while assign async state in the first one', () => {
        store.clearState()

        let counter = 0

        store.select('foo123456').subscribe(() => {
            store.assignStateAsync({
                'someKey': 'foo'
            })

            counter++
        })


        store.select('foo123456').subscribe(() => {
            counter++
        })

        store.assignState({
            foo123456: 'foo123456'
        })


        expect(counter).toBe(2)
    })
})
