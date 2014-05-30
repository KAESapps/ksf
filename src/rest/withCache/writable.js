define([

], function(

){
	return compose(function(rsc) {
		this.remote = rsc;
		this._value = {
			data: {},
			inSync: undefined,
			delta: [],
		};
	}, {
		load: function() {
			this._change({
				data: this._remote.value().data,
			});
		},
		save: function() {
			var patchArg =
			return this.remote.push(patchArg).then(function(resp) {
				self.load();
				return resp;
			});
		},
	});
});