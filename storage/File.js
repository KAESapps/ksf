define([
	'when',
	'../utils/JSONParseWithDates'
], function(
	when,
	JSONParseWithDates
){
	/**

	*/

	var fileInput = document.createElement('input');
	fileInput.type = 'file';

	var click = function(node) {
		var event = document.createEvent("MouseEvents");
		event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		node.dispatchEvent(event);
	};

	var file = {
		_previousOpeningDeferred: null,
		_previousOpeningHandler: null,
		open: function() {
			// cas d'une demande d'ouverture précédente qui n'a pas abouti ni en succès, ni en erreur (cas où l'utilisateur clique sur 'cancel' dans la boite de dialogue d'ouverture)
			if (this._previousOpeningDeferred && this._previousOpeningDeferred.promise.inspect().state === 'pending') {
				this._previousOpeningDeferred.reject('canceled');
			}
			var deferred = this._previousOpeningDeferred = when.defer();
			fileInput.onchange = function() {
				var file = fileInput.files[0];
				var reader = new FileReader();
				reader.onload = function(ev) {
					var data = JSONParseWithDates(ev.target.result);
					deferred.resolve({
						name: file.name,
						data: data,
					});
				};
				reader.onerror = function(ev) {
					deferred.reject(ev);
				};
				reader.readAsText(file);
				fileInput.value = '';
			};
			click(fileInput);
			return deferred.promise;
		},
		save: function(data, fileName) {
			var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, fileName);
		},
	};
	return file;
});