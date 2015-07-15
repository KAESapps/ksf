import registerSuite from 'intern!object';
import assert from 'intern/chai!assert';
import Store from '../Store';
import PropertyObject from '../IncrementalPropertyObject';
import Value from '../Value';

var siteStore = new Store(new PropertyObject({
    nom: new Value(),
    description: new Value(),
}));

registerSuite({
    name: 'store',
    'initValue without arg': function() {
        var value = siteStore.initValue();
        assert.deepEqual(value, {});
    },
    'initValue with arg': function() {
        var value = siteStore.initValue({
            1: {
                nom: "site 1"
            },
        });
        assert.deepEqual(value, {
            1: {
                nom: "site 1",
                description: undefined,
            },
        });
    },
    'patch one site': function() {
        var initValue = {
            0: {
                nom: 'site 1',
                description: "Description du site 1"
            },
            1: {
                nom: 'site 2',
                description: "Description du site 2"
            },
            2: {
                nom: 'site 3',
                description: "Description du site 3"
            },
        };
        var changeArg = {
            1: {
                change: {
                    nom: 'nouveau nom du site 2',
                }
            }
        };

        var value = siteStore.computeValue(changeArg, initValue);
        assert.deepEqual(value, {
            0: {
                nom: 'site 1',
                description: "Description du site 1"
            },
            1: {
                nom: 'nouveau nom du site 2',
                description: "Description du site 2"
            },
            2: {
                nom: 'site 3',
                description: "Description du site 3"
            },
        });
    },
    'insert one site': function() {
        var initValue = {
            0: {
                nom: 'site 1',
                description: "Description du site 1"
            },
            1: {
                nom: 'site 2',
                description: "Description du site 2"
            },
            2: {
                nom: 'site 3',
                description: "Description du site 3"
            },
        };
        var changeArg = {
            3: {
                add: {
                    nom: 'site 4',
                    description: "Description du site 4"
                },
            }
        };

        var value = siteStore.computeValue(changeArg, initValue);
        assert.deepEqual(value, {
            0: {
                nom: 'site 1',
                description: "Description du site 1"
            },
            1: {
                nom: 'site 2',
                description: "Description du site 2"
            },
            2: {
                nom: 'site 3',
                description: "Description du site 3"
            },
            3: {
                nom: 'site 4',
                description: "Description du site 4"
            },
        });
    },
    'remove one site': function() {
        var initValue = {
            0: {
                nom: 'site 1',
                description: "Description du site 1"
            },
            1: {
                nom: 'site 2',
                description: "Description du site 2"
            },
            2: {
                nom: 'site 3',
                description: "Description du site 3"
            },
        };
        var changeArg = {
            2: {
                remove: true,
            }
        };

        var value = siteStore.computeValue(changeArg, initValue);
        assert.deepEqual(value, {
            0: {
                nom: 'site 1',
                description: "Description du site 1"
            },
            1: {
                nom: 'site 2',
                description: "Description du site 2"
            },
        });
    },

});

