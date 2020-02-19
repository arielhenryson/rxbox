[![CircleCI](https://circleci.com/gh/arielhenryson/rxbox/tree/master.svg?style=svg)](https://circleci.com/gh/arielhenryson/rxbox/tree/master)



Simple state container for Angular application
====================================
RXBox let's you handle your Application state in one place.
You retain the responsibility for updating the state to your app.
It gives you an easy API to deal with your app's state.

<br>



Getting started
---------------
Install `rxbox` using npm.
```shell
npm install rxbox --save
```



Add RXBox to your main NgModule providers array
```javascript
providers: [
  { provide: RXBox, useClass: RXBox }
]
```
import it into a component
```javascript
import { RXBox } from 'rxbox'
```

Inject it to your constructor
```javascript
 constructor(
        private store: RXBox,
    ) {}
```
Now you can start interacting with the store from your component.


<br>

### API
## assignState(stateChanges)
assignState push data to the store

*Note if you have multiple subscribers open, and you are 'assignState'
inside one of the callback, it is possible that you will prevent one of the subscribers
to run. Because the 'watch' and 'select' methods run only if the key that you subscribe to is
in the last change of the store. Therefore if you are not sure, it is best to use 'assignStateAsync' over  'assignState'

```javascript
 this.store.assignState({ foo: bar })
```

## assignStateAsync(stateChanges): Promise<void>
assignStateAsync push data to the store only after all I/O events in the current snapshot are processed 
```javascript
 await this.store.assignStateAsync({ foo: bar })
```

## clearState()
clearState will completely remove the current state and will replace it with empty object
```javascript
 this.store.clearState()
```
## getState(passByReference [optional] )
Return copy of current app state object.
if not sending true to passByReference it will return a copy of the state
```javascript
 this.store.getState()
```



## select(key, subscriberName [optional], passByReference [optional] )
Doing exactly the same thing as watch but also return the previous value if any.
Note that if the current value in the store is new, watch will also behave the same way
as select and will fire instantly the data 

You can add name to subscriber (subscriberName) and then see if they open from console with RXBox.subscribers 
```javascript
this.store.select('foo').subscribe(
    val => {
        console.log('change in foo value',  val)
    }
)
// nested key watch
this.store.select('foo.bar').subscribe(
    val => {
        console.log('change in bar value',  val)
    }
)
```


## debug
If you want to use the state history  feature, you have to first set debug to true
```javascript
this.store.debug = true
```

## sessionStorage
save the store to the sessionStorage
```javascript
this.store.saveToSessionStorage = true
```
```javascript
this.store.saveToSessionStorage = true
```

## localStorage
save the store to the localStorage
```javascript
this.store.saveToLocalStorage = true
```

## Get data from the storage 
to restore from localStorage or from sessionStorage use getStoreFromSessionStorage() or getStoreFromLocalStorage()
don't try to get the value from the storage yourself without the getters (the storage also store metadata)`
`

## getHistory()
Show the history of the state (first you have to set debug to true)
```javascript
this.store.getHistory()
```
## clearHistory()
Remove all state history
```javascript
this.store.clearHistory()
```
