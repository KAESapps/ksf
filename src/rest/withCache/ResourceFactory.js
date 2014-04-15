define([
	'compose',
	'../../observable/_Stateful',
	'../../observable/model/BasicPropertyObject',
	'../../observable/model/PropertyObjectOrUndefined',
	'../../observable/model/Value',
	'dojo/request',

], function(
	compose,
	_Stateful,
	BasicPropertyObject,
	PropertyObjectOrUndefined,
	Value,
	request
){
	var diffRestRessource = function() {};
	var getPatchArg = function() {};

	var ResourceFactory = compose(function(itemModel) {
		var model = new BasicPropertyObject({
			dataTime: new Value(),
			lastRequestStatus: new PropertyObjectOrUndefined({
				started: new Value(),
				finished: new Value(),
				stage: new Value(),
			}),
			data: itemModel,
		});
		this.ctr = compose(function(url) {
			this._url = url;
			this._value = {
				dataTime: undefined,
				data: undefined,
				lastRequestStatus: undefined,
			};
		},
		_Stateful,
		model.accessorMixin,
		{
			// value is read only for public users
			value: function() {
				return this._getValue();
			},
			onValue: function(cb) {
				return this._onValue(cb);
			},
			_computer: model.computer,
			pull: function() {
				this._change({
					lastRequestStatus: {
						started: new Date(),
						finished: undefined,
						stage: 'inProgress',
					}
				});
				return request.get(this._url).then(function(resp) {
					// TODO
					// var diff = diffRestRessource(this.value().data, resp.data);
					// var dataPatchArg = getPatchArg(diff);
					this._change({
						dataTime: new Date(),
						data: resp ,
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