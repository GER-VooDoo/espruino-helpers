function Map(iterable) {
    var _items = [];
    var _keys = [];
    var _values = [];

    var is = Object.is || function(a, b) {
        return a === b ?
            a !== 0 || 1 / a == 1 / b :
            a != a && b != b;
    };

    var betterIndexOf = function(value) {
        var i;
        if(value != value || value === 0) {
            for(i = this.length; i-- && !is(this[i], value);){}
        } else {
            i = [].indexOf.call(this, value);
        }
        return i;
    };

    var MapIterator = function MapIterator(map, kind) {
        var _index = 0;

        return Object.create({}, {
            next: {
                value: function() {
                    if (_index < map.items().length) {
                        switch(kind) {
                            case 'keys': return map.keys()[_index++];
                            case 'values': return map.values()[_index++];
                            case 'keys+values': return [].slice.call(map.items()[_index++]);
                            default: throw new TypeError('Invalid iterator type');
                        }
                    }
                    throw new Error('Stop Iteration');
                }
            },
            iterator: {
                value: function() {
                    return this;
                }
            },
            toString: {
                value: function() {
                    return '[object Map Iterator]';
                }
            }
        });
    };

    var _set = function(key, value) {
        // check if key exists and overwrite
        var index = betterIndexOf.call(_keys, key);
        if (index > -1) {
            _items[index] = value;
            _values[index] = value;
        } else {
            _items.push([key, value]);
            _keys.push(key);
            _values.push(value);
        }
    };

    var setItem = function(item) {
        if (item.length !== 2) {
            throw new TypeError('Invalid iterable passed to Map constructor');
        }

        _set(item[0], item[1]);
    };

    if (Array.isArray(iterable)) {
        iterable.forEach(setItem);
    } else if (iterable !== undefined) {
        throw new TypeError('Invalid Map');
    }

    return Object.create(MapPrototype, {
        items:{
            value:function() {
                return [].slice.call(_items);
            }
        },
        keys:{
            value:function() {
                return [].slice.call(_keys);
            }
        },
        values:{
            value:function() {
                return [].slice.call(_values);
            }
        },
        has:{
            value:function(key) {
                var index = betterIndexOf.call(_keys, key);
                return index > -1;
            }
        },
        get:{
            value:function(key) {
                var index = betterIndexOf.call(_keys, key);
                return index > -1 ? _values[index] : undefined;
            }
        },
        set:{
            value: _set
        },
        size:{
            get:function() {
                return _items.length;
            }
        },
        clear:{
            value:function() {
                _keys.length = _values.length = _items.length = 0;
            }
        },
        'delete':{
            value:function(key) {
                var index = betterIndexOf.call(_keys, key);
                if (index > -1) {
                    _keys.splice(index, 1);
                    _values.splice(index, 1);
                    _items.splice(index, 1);
                    return true;
                }
                return false;
            }
        },
        forEach:{
            value:function(callbackfn /*, thisArg*/) {
                if (typeof callbackfn != 'function') {
                    throw new TypeError('Invalid callback function given to forEach');
                }

                function tryNext() {
                    try {
                        return iter.next();
                    } catch(e) {
                        return undefined;
                    }
                }

                var iter = this.iterator();
                var current = tryNext();
                var next = tryNext();
                while(current !== undefined) {
                    callbackfn.apply(arguments[1], [current[1], current[0], this]);
                    current = next;
                    next = tryNext();
                }
            }
        },
        iterator:{
            value: function() {
                return new MapIterator(this, 'keys+values');
            }
        },
        toString:{
            value: function() {
                return '[Object Map]';
            }
        }
    });
}

Map.prototype.filter = function(filterFn) {
    if (typeof filterFn != 'function') {
        throw new TypeError('Expected a function argument');
    }
    var _map = new Map();
    this.forEach(function(value, key, map) {
        if(filterFn(key, value, map)) {
            _map.set(key, value);
        }
    });
    return _map;
};

Map.prototype.merge = function(otherMap) {
    if (!(otherMap instanceof Map)) {
        throw new TypeError('Cannot merge with objects that are not Maps');
    }

    function setAll(value, key) {
        _map.set(key, value);
    }
    var _map = new Map();

    this.forEach(setAll);
    otherMap.forEach(setAll);
    return _map;
};

Map.prototype.fetch = function(key, defaultValue) {
    if (this.has(key)) {
        return this.get(key);
    }
    return defaultValue;
};

Map.prototype.invert = function() {
    var _map = new Map();
    this.forEach(_map.set);
    return _map;
};

Map.prototype.reject = function(filterFn) {
    if (typeof filterFn != 'function') {
        throw new TypeError('Expected a function argument');
    }
    this.forEach(function(value, key, map) {
        if(filterFn(key, value, map)) {
            map['delete'](key);
        }
    }.bind(this));
};

Map.prototype.isEmpty = function() {
    return this.keys().length === 0;
};

exports = Map;
