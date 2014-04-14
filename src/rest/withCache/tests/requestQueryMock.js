define([
	'dojo/Deferred',
], function(
	Deferred

){
	var requestMock = {
		get: function() {
			var deferred = new Deferred();
			deferred.resolve([{
				id: "1",
				name: "site 1",
			}, {
				id: "2",
				name: "site 2",
			}, {
				id: "3",
				name: "site 3",
			}]);
			return deferred;
		},
	};
	return requestMock;
});