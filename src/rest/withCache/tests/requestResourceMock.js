define([
	'dojo/Deferred',
], function(
	Deferred

){
	var requestMock = {
		get: function() {
			var deferred = new Deferred();
			deferred.resolve({
				name: "site 1",
				description: "description du site 1",
				surface: 12.3,
			});
			return deferred;
		},
	};
	return requestMock;
});