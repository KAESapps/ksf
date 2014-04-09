define([
	'compose',
	'../../observable/sync/_PatchableStateful',
	'../../observable/sync/propertyObject/_WithPropertyAccessors',
	'../../observable/sync/propertyObject/PropertyAccessor',
	'../../observable/sync/propertyObject/CompositePropertyAccessor',
	'../../observable/computers/deepMapPatcher',
	'dojo/request',

], function(
	compose,
	_PatchableStateful,
	_WithPropertyAccessors,
	PropertyAccessor,
	CompositePropertyAccessor,
	deepMapPatcher,
	request

){
	var diffRestRessource = function() {};
	var getPatchArg = function() {};

	var RestRessource = compose(_PatchableStateful.custom({
		patch: '_patch',
	}), _WithPropertyAccessors, function(url) {
		this._url = url;
		this._value = {
			dataTime: undefined,
			data: undefined,
			lastRequestStatus: undefined,
		};
	}, {
		// value is read only for public users
		value: function() {
			return this._getValue();
		},
		_computer: deepMapPatcher,
		_accessorFactories: {
			dataTime: PropertyAccessor,
			data: compose(CompositePropertyAccessor, _WithPropertyAccessors, {
				_createPropertyAccessor: function(id) {
					return new PropertyAccessor(this, id);
				},
			}),
			lastRequestStatus: compose(CompositePropertyAccessor, _WithPropertyAccessors, {
				_accessorFactories: {
					started: PropertyAccessor,
					finished: PropertyAccessor,
					stage: PropertyAccessor,
				},
			})
		},
		pull: function() {
			this._patch({
				set: {
					lastRequestStatus: {
						started: new Date(),
						finished: undefined,
						stage: 'inProgress',
					}
				}
			});
			return request.get(this._url).then(function(resp) {
				var diff = diffRestRessource(this.value().data, resp.data);
				var dataPatchArg = getPatchArg(diff);
				this._patch({
					set: {
						dataTime: new Date(),
						data: resp,
					},
					patch: {
						data: diff,
						lastRequestStatus: {
							set: {
								finished: new Date(),
								stage: 'success',
							},
						},
					},
				});
			}.bind(this), function(resp) {
				this._patch({
					patch: {
						lastRequestStatus: {
							set: {
								finished: new Date(),
								stage: 'error',
							},
						},
					},
				});
			});
		},
		push: function(data) {},
	});

	return RestRessource;
});