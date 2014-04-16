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
	'../../../observable/model/Value',
	'../../../observable/model/Integer',
	'lodash/objects/cloneDeep',
], function(
	registerSuite,
	assert,
	ResourceFactory,
	Value,
	Integer,
	cloneDeep
){
	var Site = new ResourceFactory({
		name: new Value(),
		description: new Value(),
		surface: new Integer(),
	}).ctr;

	registerSuite({
		"pull": function() {
			var observedSite1Values = [];
			var site1 = new Site("1");

			assert.deepEqual(site1.value(), {
				dataTime: undefined,
				data: {},
				lastRequestStatus: undefined,
			});

			site1.onChange(function() {
				observedSite1Values.push(cloneDeep(site1.value()));
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
					data: {},
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
						surface: 12,
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

			site1.prop('lastRequestStatus').prop('stage').onChange(function(value) {
				observedStageValues.push(value);
			});

			return site1.pull().then(function() {
				assert.deepEqual(observedStageValues, [
					'inProgress',
					'success',
				]);
			});
		},
	});
});