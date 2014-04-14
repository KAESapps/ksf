require.config({
	map: {
		ksf: {
			'dojo/request': 'ksf/rest/withCache/tests/requestQueryMock',
		}
	}
});
define([
	'intern!object',
	'intern/chai!assert',
	'../Manager',
	'lodash/objects/cloneDeep',
], function(
	registerSuite,
	assert,
	Manager,
	cloneDeep
){
	registerSuite({
		name: "pull query",
		"query data": function() {
			var observedSitesPage1Values = [];
			var manager = new Manager("baseUrl");

			var sitesPage1 = manager.query("page1");
			assert.deepEqual(sitesPage1.value(), {
				dataTime: undefined,
				data: undefined,
				lastRequestStatus: undefined,
			});


			sitesPage1.onValue(function(value) {
				observedSitesPage1Values.push(cloneDeep(value));
			});


			return sitesPage1.pull().then(function() {
				var started = sitesPage1.value().lastRequestStatus.started;
				var finished = sitesPage1.value().lastRequestStatus.finished;
				var dataTime = sitesPage1.value().dataTime;

				assert.deepEqual(observedSitesPage1Values, [
					{
						dataTime: undefined,
						data: undefined,
						lastRequestStatus: {
							started: started,
							finished: undefined,
							stage: 'inProgress',
						}
					},
					{
						dataTime: dataTime,
						data: ["1", "2", "3"],
						lastRequestStatus: {
							started: started,
							finished: finished,
							stage: 'success',
						}
					},
				]);
			});
		},
		"resources data": function() {
			var manager = new Manager("baseUrl");
			var sitesPage1 = manager.query("page1");
			return sitesPage1.pull().then(function() {
				var dataTime = manager.item("1").value().dataTime;
				assert(dataTime - new Date() < 1000); // be sure that's a date and it is quite recent
				assert.deepEqual(manager.item("1").value(), {
					dataTime: dataTime,
					data: { name: 'site 1'},
					lastRequestStatus: undefined, // data was provided by pulling a query and not this resource directly
				});
			});
		},
	});
});