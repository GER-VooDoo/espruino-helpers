/**
 * Usage:
 *  const EM = require("https://raw.githubusercontent.com/GER-VooDoo/espruino-helpers/master/emitter.js");
 *  const Emitter = EM.Emitter, EmitterEventMap = EM.EmitterEventMap;
 */

/**
 * Basic Map (es6-map is not available)
 */
class EmitterEventMap {
    constructor(){
      this.items = {};
      this.get = (key) => {
        return this.items[key];
      };
      this.set = (key, value) => {
        this.items[key] = value;
      };
    }
    has(key){
        return (typeof(this.items[key]) !== "undefined") ? true : false;
    }
    forEach(cb){
        for (let key in this.items) {
            cb(this.items[key], key, this);
        }
    }
}

/**
 * Emitter class
 */
class Emitter {
    constructor() {
        this.listeners = new EmitterEventMap();
    }
    addListener(label, callback, vm) {
        if (typeof callback === 'function') {
            this.listeners.has(label) || this.listeners.set(label, []);
            this.listeners.get(label).push({callback: callback, vm: vm});

            return true;
        }

        return false;
    }
    removeListener(label, callback, vm) {
        let listeners = this.listeners.get(label),
            index;

        if (listeners && listeners.length) {
            index = listeners.reduce((i, listener, index) => {
                return (typeof listener.callback === 'function' && listener.callback === callback && listener.vm === vm) ?
                    i = index :
                    i;
            }, -1);

            if (index > -1) {
                listeners.splice(index, 1);
                this.listeners.set(label, listeners);
                return true;
            }
        }
        return false;
    }
    on(label, callback, vm) {
        return this.addListener(label, callback, vm);
    }
    off(label, callback, vm) {
        return this.removeListener(label, callback, vm);
    }
    emit(label, args) {
        let ret = false;
        this.listeners.forEach((listeners, key) => {
            if (this.eq(label, key) && listeners && listeners.length) {
                listeners.forEach((listener) => {
                    listener.callback.call(listener.vm, args, label);
                });
                ret = true;
            }
        });
        return ret;
    }
    eq(str1, str2) {
        let arr1 = str1.split('/');
        let arr2 = str2.split('/');
        if (str1.indexOf('#') !== -1 && str2.indexOf('#') !== -1 && arr1.length !== arr2.length) {
            return false;
        }
        if (arr2.length < arr1.length) {
            arr2 = str1.split('/');
            arr1 = str2.split('/');
        }
        let ret = true;
        arr1.forEach((val, i) => {
            if (val === '+' || val === '#'
                || (arr2[i] && arr2[i] === '+')
                || (arr2[i] && arr2[i] === '#')
                || (arr2[i] && arr2[i] === val)) {
                return;
            }
            ret = false;
        });
        return ret;
    }
}

exports.EmitterEventMap = EmitterEventMap;
exports.Emitter = Emitter;
