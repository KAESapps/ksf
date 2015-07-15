/*require.config({
	map: {
		ksf: {
			'dojo/request': 'ksf/rest/withCache/tests/requestQueryMock',
		}
	}
});
*/import registerSuite from 'intern!object';
import assert from 'intern/chai!assert';
import Query from '../Query';
import cloneDeep from 'lodash/objects/cloneDeep';
import sourceProvider from './sourceProvider';
var managerMock = {
    item: function() {
        return {
            _change: function() {},
        };
    }
};

registerSuite({
    "pull": function() {
        var observedPage1Values = [];
        var page1 = new Query(managerMock, sourceProvider.query());

        assert.deepEqual(page1.value(), {
            dataTime: undefined,
            data: [],
            lastRequestStatus: undefined,
        });

        page1.onChange(function() {
            observedPage1Values.push(cloneDeep(page1.value()));
        });

        return page1.pull().then(function() {
            var started = page1.value().lastRequestStatus.started;
            var finished = page1.value().lastRequestStatus.finished;
            var dataTime = page1.value().dataTime;
            assert(started - new Date() < 1000); // be sure that's a date and it is quite recent
            assert(dataTime - new Date() < 1000); // be sure that's a date and it is quite recent
            assert(finished - new Date() < 1000); // be sure that's a date and it is quite recent

            assert.deepEqual(observedPage1Values, [{
                dataTime: undefined,
                data: [],
                lastRequestStatus: {
                    started: started,
                    finished: undefined,
                    stage: 'inProgress',
                },
            }, {
                dataTime: dataTime,
                data: ["1", "2", "3"],
                lastRequestStatus: {
                    started: started,
                    finished: finished,
                    stage: 'success',
                },
            }]);

        });
    },
    "observe data": function() {
        var observedValues = [];
        var page1 = new Query(managerMock, sourceProvider.query());

        page1.prop('data').onChange(function(value) {
            observedValues.push(value);
        });

        return page1.pull().then(function() {
            assert.deepEqual(observedValues, [
                ["1", "2", "3"],
            ]);
        });
    },

});