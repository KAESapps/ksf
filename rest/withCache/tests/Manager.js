import registerSuite from 'intern!object';
import assert from 'intern/chai!assert';
import Manager from '../Manager';
import Value from '../../../observable/model/Value';
import Integer from '../../../observable/model/Integer';
import cloneDeep from 'lodash/objects/cloneDeep';
import sourceProvider from './sourceProvider';
var manager = new Manager({
    properties: {
        nom: new Value(),
        surface: new Integer(),
    },
    source: sourceProvider,
});

registerSuite({
    "resource data updated by pulling a query": function() {
        var page1 = manager.query("page1");
        return page1.pull().then(function() {
            assert.equal(Object.keys(manager._resources).length, 3);
            var site1 = manager.item("1");

            var dataTime = site1.value().dataTime;
            assert(dataTime - new Date() < 1000); // be sure that's a date and it is quite recent
            assert.deepEqual(site1.value(), {
                dataTime: dataTime,
                data: {
                    nom: 'Site 1',
                    surface: 12,
                },
                lastRequestStatus: undefined, // data was provided by pulling a query and not this resource directly
            });
        });
    },
});