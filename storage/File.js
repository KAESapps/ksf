define([
	'dojo/Deferred',
], function(
	Deferred
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
		_previousOpeningDeffered: null,
		_previousOpeningHandler: null,
		open: function() {
			// cas d'une demande d'ouverture précédente qui n'a pas abouti ni en succès, ni en erreur (cas où l'utilisateur clique sur 'cancel' dans la boite de dialogue d'ouverture)
			if (this._previousOpeningDeffered && !this._previousOpeningDeffered.isFulfilled()) {
				this._previousOpeningDeffered.reject('canceled');
			}
			var deferred = this._previousOpeningDeffered =  when.promise(function(resolve, reject) {
				fileInput.onchange = function() {
					var file = fileInput.files[0];
					var reader = new FileReader();
					reader.onload = function(ev) {
						var data = JSON.parse(ev.target.result);
						resolve({
							name: file.name,
							data: data,
						});
					};
					reader.onerror = function(ev) {
						reject(ev);
					};
					reader.readAsText(file);
					fileInput.value = '';
				};

			});
			click(fileInput);
			return deferred;
		},
		save: function(data, fileName) {
			var blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, fileName);
		},
	};
	return file;
});