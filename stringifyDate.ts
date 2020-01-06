import * as jsonStringifySafe from 'json-stringify-safe'
import * as moment from 'moment-mini'


const options = {
    utc: false,
    handleCircular: true
}


function isISO8601String(dateString) {
    let dateregex = /^([0-9]{4})\-([0-9]{1,2})\-([0-9]{1,2})([T\s]([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2})(\.([0-9]+))?)?(Z|([+\-])([0-9]{1,2})(:([0-9]{1,2}))?)?)?$/
    return dateregex.test(dateString)
}


function fnReviver(reviver) {
    return function (key, value) {
        if (isISO8601String(value)) {
            value = moment(value).toDate()
        }

        if (reviver) {
            value = reviver(key, value)
        }

        return value
    }
}


function fnReplacer(replacer) {
    let fn = replacer

    if (!options.utc) {
        fn = function (key, value) {
            if (isISO8601String(value)) {
                value = moment(value).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            }
            if (replacer) {
                value = replacer(key, value)
            }
            return value
        }
    }

    return fn
}

export const stringifyDate = {
    stringify: (value, replacer?, space?) => {
        let strFn

        if (options.handleCircular) {
            strFn = jsonStringifySafe
        } else {
            strFn = JSON.stringify
        }

        return strFn(value, fnReplacer(replacer), space)
    },
    parse: (text, reviver?) => {
        return JSON.parse(text, fnReviver(reviver))
    },
    setOptions: opt => {
        let key
        for (key in opt) {
            if (opt.hasOwnProperty(key)) {
                options[key] = opt[key]
            }
        }
    },
    getReviver: fnReviver,
    getReplacer: fnReplacer
}