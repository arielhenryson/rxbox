import { Observable, BehaviorSubject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'
import * as _ from 'lodash'


import { stringifyDate } from './stringifyDate'
import { createUUID } from './uuid'


const appState = {}
const store = new BehaviorSubject<any>(appState)


const slotInStorage = '__rxbox'


export class RXBox<stateSchema = any> {
    private static isWasRun = false
    private lastChanges = null
    private store: BehaviorSubject<any> = store

    saveToLocalStorage = false
    saveToSessionStorage = false

    // hold the history of the app state
    // only work when debug is set to true
    private history = []

    private subscribers = []


    constructor() {
        if (RXBox.isWasRun && typeof window !== 'undefined') {
            throw 'You can only create one instance of RXBox in your app'
        }

        RXBox.isWasRun = true

        if (typeof window !== 'undefined') {
            ((window: any) => {
                window.RXBox = {
                    state: this.store,
                    history: this.history,
                    subscribers: this.subscribers
                }
            })(window)
        }
    }


    private static preventFunctionsInKey(obj) {
        for (let i in obj) {
            if (obj[i] !== null && typeof obj[i] === 'object') {
                RXBox.preventFunctionsInKey(obj[i])
            }

            if (typeof obj[i] === 'function') {
                throw {
                    msg: "RXBox error -> can't store function inside RXBox store",
                    object: obj,
                    key: obj[i]
                }
            }
        }
    }


    // Observable that watch for any change in the store
    private changes = store.asObservable().pipe(
        distinctUntilChanged()
    )


    // push old state to history
    private pushHistory() {
        // prevent save more then one version in the history when not
        // running in debug mode
        if (!this.debug && this.history.length) {
            this.history.shift()
        }

        const state = this.getState()
        this.history.push(state)
    }


    // ************************** API **************************

    // change this for true when you want to push to history
    debug = false


    // show the history of the state
    getHistory() {
        return this.history
    }


    // remove all state history
    clearHistory() {
        this.history = []
    }


    // watch for key change in store (you can also use nested key
    // like "key1.key2.key3")
    /**
     * @deprecated Since version 0.5.6. Will be deleted in future version
     */
    watch(key?: any, subscriberName?: string, passByReference?: boolean) {
        return new Observable<any>(observer => {
            const uuid = createUUID()

            this.subscribers[uuid] = {
                name: subscriberName,
                key
            }

            const sub = this.changes.subscribe(state => {
                // watch for all change (no key specified)
                if (typeof key === 'undefined') {
                    if (passByReference) {
                        observer.next(state)
                    } else {
                        observer.next(
                            _.cloneDeep(state)
                        )
                    }

                    return
                }


                // if we inside this catch meaning that the key to watch
                // is not inside the last change so we can return
                // without response to the subscribers
                const isKeyInLastChange = _.get(this.lastChanges, key)
                if (typeof isKeyInLastChange === 'undefined') return

                const newValue = _.get(state, key)
                const oldState = this.history[this.history.length - 1]
                const oldValue = _.get(oldState, key)
                const equals = _.isEqual(newValue, oldValue)
                if (!equals) {
                    const val = _.get(state, key)
                    if (passByReference) {
                        observer.next(val)
                    } else {
                        observer.next(
                            _.cloneDeep(
                                val
                            )
                        )
                    }
                }
            })


            observer.add(() => {
                sub.unsubscribe()
                delete this.subscribers[uuid]
            })
        })
    }


    // watch for key change in store (you can also use nested key
    // like "key1.key2.key3")
    select(key?: any, subscriberName?: string, passByReference?: boolean) {
        return new Observable<any>(observer => {
            const uuid = createUUID()

            this.subscribers[uuid] = {
                name: subscriberName,
                key
            }

            // get all keys (no key specified)
            let skip = false
            const STATE = this.store.getValue()
            let value
            if (typeof key === 'undefined') {
                if (typeof STATE !== 'undefined') {
                    if (passByReference) {
                        observer.next(STATE)
                    } else {
                        observer.next(
                            _.cloneDeep(STATE)
                        )
                    }

                    skip = true
                }
            } else { // get specific key
                value = _.get(STATE, key)
                if (typeof value !== 'undefined') {
                    if (passByReference) {
                        observer.next(value)
                    } else {
                        observer.next(
                            _.cloneDeep(value)
                        )
                    }

                    skip = true
                }
            }


            const sub = this.changes.subscribe(state => {
                // watch for all change (no key specified)
                if (typeof key === 'undefined') {
                    if (skip && _.isEqual(STATE, state)) {
                        skip = false
                        return
                    }


                    if (passByReference) {
                        observer.next(state)
                    } else {
                        observer.next(
                            _.cloneDeep(state)
                        )
                    }


                    skip = false
                    return
                }


                // is not inside the last change so we can return
                // without response to the subscribers
                const isKeyInLastChange = _.get(this.lastChanges, key)
                if (typeof isKeyInLastChange === 'undefined') return

                const newValue = _.get(state, key)
                const oldState = this.history[this.history.length - 1]
                const oldValue = _.get(oldState, key)
                const equals = _.isEqual(newValue, oldValue)
                if (!equals) {
                    if (skip && _.isEqual(newValue, value)) {
                        skip = false
                        return
                    }


                    const val = _.get(state, key)
                    if (passByReference) {
                        observer.next(val)
                    } else {
                        observer.next(
                            _.cloneDeep(val)
                        )
                    }

                    skip = false
                }
            })


            observer.add(() => {
                sub.unsubscribe()
                delete this.subscribers[uuid]
            })
        })
    }


    // return current state
    getState(passByReference?): stateSchema {
        if (passByReference) return this.store.value

        return _.cloneDeep(this.store.value)
    }


    // remove current state
    clearState() {
        this.store.next({})
    }


    // merge new keys to the current state
    assignState(stateChanges: Partial<stateSchema>) {
        if (this.debug) RXBox.preventFunctionsInKey(stateChanges)


        const newState = _.assign({}, this.getState(), stateChanges)

        this.pushHistory()
        this.lastChanges = stateChanges

        this.store.next(newState)

        if (this.saveToLocalStorage) {
            localStorage.setItem(slotInStorage, stringifyDate.stringify(this.getState()))
        }

        if (this.saveToSessionStorage) {
            sessionStorage.setItem(slotInStorage, stringifyDate.stringify(this.getState()))
        }
    }


    assignStateAsync(stateChanges: Partial<stateSchema>): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                this.assignState(stateChanges)

                resolve()
            })
        })
    }


    getStoreFromSessionStorage() {
        return stringifyDate.parse(sessionStorage.getItem(slotInStorage))
    }


    getStoreFromLocalStorage() {
        return stringifyDate.parse(localStorage.getItem(slotInStorage))
    }
}
