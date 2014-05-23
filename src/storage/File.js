define([
	'dojo/Deferred',
], function(
	Deferred
){
	/**

	*/
	var file = {
		open: function(file) {
			var reader = new FileReader();
			var deferred = new Deferred();
			reader.onload = function(ev) {
				var data = JSON.parse(ev.target.result);
				deferred.resolve(data);
			};
			reader.onerror = function(ev) {
				deferred.reject(ev);
			};
			reader.readAsText(file);
			return deferred;
		},
		save: function(data, fileName) {
			var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, fileName);
			return {
				then: function(cb) {
					cb();
				}
			};
		},
	};
	return file;
});