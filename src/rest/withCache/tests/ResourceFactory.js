require.config({
	map: {
		ksf: {
			'dojo/request': 'ksf/rest/withCache/tests/requestResourceMock',
		}
	}
});
define([
	'intern!object',
	'intern/chai!assert',
	'../ResourceFactory',
	'../../../observable/model/PropertyObjectOrUndefined',
	'../../../observable/model/Value',
	'lodash/objects/cloneDeep',
], function(
	registerSuite,
	assert,
	ResourceFactory,
	PropertyObjectOrUndefined,
	Value,
	cloneDeep
){
	var Site = new ResourceFactory(new PropertyObjectOrUndefined({
		name: new Value(),
		description: new Value(),
	})).ctr;

	registerSuite({
		"pull": function() {
			var observedSite1Values = [];
			var site1 = new Site("1");

			assert.deepEqual(site1.value(), {
				dataTime: undefined,
				data: undefined,
				lastRequestStatus: undefined,
			});

			site1.onValue(function(value) {
				observedSite1Values.push(cloneDeep(value));
			});

			return site1.pull().then(function() {
				var started = site1.value().lastRequestStatus.started;
				var finished = site1.value().lastRequestStatus.finished;
				var dataTime = site1.value().dataTime;
				assert(started - new Date() < 1000); // be sure that's a date and it is quite recent
				assert(dataTime - new Date() < 1000); // be sure that's a date and it is quite recent
				assert(finished - new Date() < 1000); // be sure that's a date and it is quite recent

				assert.deepEqual(observedSite1Values, [{
					dataTime: undefined,
					data: undefined,
					lastRequestStatus: {
						started: started,
						finished: undefined,
						stage: 'inProgress',
					},
				}, {
					dataTime: dataTime,
					data: {
						name: 'site 1',
						description: "description du site 1",
					},
					lastRequestStatus: {
						started: started,
						finished: finished,
						stage: 'success',
					},
				}]);

			});
		},
		"observe stage": function() {
			var observedStageValues = [];
			var site1 = new Site("1");

			site1.prop('lastRequestStatus').prop('stage').onValue(function(value) {
				observedStageValues.push(value);
			});

			return site1.pull().then(function() {
				assert.deepEqual(observedStageValues, [
					'inProgress',
					'success',
				]);
			});
		},
		"observe name": function() {
			var observedValues = [];
			var site1 = new Site("1");

			site1.prop('data').prop('name').onValue(function(value) {
				observedValues.push(value);
			});

			return site1.pull().then(function() {
				assert.deepEqual(observedValues, [
					"site 1",
				]);
			});
		},
	});
});