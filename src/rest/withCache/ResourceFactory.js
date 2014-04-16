define([
	'compose',
	'../../observable/_StatefulWithLogic',
	'../../observable/model/IncrementalPropertyObject',
	'../../observable/model/AtomicPropertyObject',
	'../../observable/model/PropertyObjectOrUndefined',
	'../../observable/model/Value',

], function(
	compose,
	_StatefulWithLogic,
	IncrementalPropertyObject,
	AtomicPropertyObject,
	PropertyObjectOrUndefined,
	Value
){

	var ResourceFactory = compose(function(properties) {
		var model = new IncrementalPropertyObject({
			dataTime: new Value(),
			lastRequestStatus: new PropertyObjectOrUndefined({
				started: new Value(),
				finished: new Value(),
				stage: new Value(),
			}),
			data: new AtomicPropertyObject(properties),
		});
		this.ctr = compose(function(source) {
			this._source = source;
			this._value = {
				dataTime: undefined,
				data: {},
				lastRequestStatus: undefined,
			};
		},
		_StatefulWithLogic,
		model.accessorMixin,
		{
			_computer: model.computer,
			pull: function() {
				this._change({
					lastRequestStatus: {
						started: new Date(),
						finished: undefined,
						stage: 'inProgress',
					}
				});
				return this._source.get().then(function(resp) {
					// TODO
					// var diff = diffRestRessource(this.value().data, resp.data);
					// var dataPatchArg = getPatchArg(diff);
					this._change({
						dataTime: new Date(),
						data: resp,
						lastRequestStatus: {
							finished: new Date(),
							stage: 'success',
						},
					});
				}.bind(this),
				// error
				function(resp) {
					this._change({
						lastRequestStatus: {
							finished: new Date(),
							stage: 'error',
						},
					});
				});
			},
			push: function(data) {},
		});
	});

	return ResourceFactory;
});