define([
	'dojo/Deferred',
], function(
	Deferred

){
	var requestMock = {
		get: function() {
			var deferred = new Deferred();
			deferred.resolve({name: "site 1"});
			return deferred;
		},
	};
	return requestMock;
});