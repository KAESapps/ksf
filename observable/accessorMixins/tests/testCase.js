import registerSuite from 'intern!object';
import assert from 'intern/chai!assert';
import compose from 'compose';
import Store from '../Store';
import Value from '../Value';
import IncrementalPropertyObject from '../IncrementalPropertyObject';
var StatefulMock = compose(function() {
    this.changesArgs = [];
}, {
    _change: function(changesArg) {
        this.changesArgs.push(changesArg);
    },
    _getValue: function() {
        return {
            1: {
                nom: "Site 1",
                description: "description du site 1",
                adresse: {
                    rue: "av de la République",
                    ville: 'Choisy',
                },
            }
        };
    },
});

var SiteStoreAccessorMixin = new Store(new IncrementalPropertyObject({
    nom: new Value().ctr,
    description: new Value().ctr,
    adresse: new IncrementalPropertyObject({
        rue: new Value().ctr,
        ville: new Value().ctr,
    }).ctr,
}).ctr).ctr;

var SiteStore = compose(SiteStoreAccessorMixin, StatefulMock);
var siteStore;

registerSuite({
    'beforeEach': function() {
        siteStore = new SiteStore();
    },
    'add': function() {
        siteStore.add({
            nom: "Site 1",
            description: "description du site 1",
            adresse: {
                rue: "av de la République",
                ville: 'Choisy',
            },
        }, "1");

        assert.deepEqual(siteStore.changesArgs, [{
            1: {
                add: {
                    nom: "Site 1",
                    description: "description du site 1",
                    adresse: {
                        rue: "av de la République",
                        ville: 'Choisy',
                    },
                }
            }
        }]);
    },
    'item accessor get value': function() {
        var site1Accessor = siteStore.item("1");
        assert.deepEqual(site1Accessor.value(), {
            nom: "Site 1",
            description: "description du site 1",
            adresse: {
                rue: "av de la République",
                ville: 'Choisy',
            },
        });

    },
    'prop accessor get value': function() {
        var site1Accessor = siteStore.item("1");
        var nomDuSite1 = site1Accessor.prop('nom');
        assert.equal(nomDuSite1.value(), "Site 1");

    },
    'prop accessor replace value': function() {
        var site1Accessor = siteStore.item("1");
        var nomDuSite1 = site1Accessor.prop('nom');
        nomDuSite1.value("Nouveau nom du site 1");

        assert.deepEqual(siteStore.changesArgs, [{
            1: {
                change: {
                    nom: "Nouveau nom du site 1",
                }
            }
        }]);
    },
});