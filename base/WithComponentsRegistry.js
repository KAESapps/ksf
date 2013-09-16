define([
	"compose/compose",
	"ksf/collections/Dict",
	'ksf/utils/destroy',
], function(
	compose,
	Dict,
	destroy
){

	var WithComponentsRegistryGenerator = function(args){
		var REGISTRY = args && args.registryName || "_components";
		var FACTORIES = args && args.factoriesName || "factories";

		var WithComponentsRegistry = function(args){
			this[REGISTRY] = new Dict();
			this[REGISTRY][FACTORIES] = new Dict();
		};
		WithComponentsRegistry.prototype = {
			destroy: function(){
				destroy(this[REGISTRY]);
			},
		};
		return WithComponentsRegistry;

	};

	var WithComponentsRegistry = WithComponentsRegistryGenerator();
	WithComponentsRegistry.create = WithComponentsRegistryGenerator;

	return WithComponentsRegistry;
});