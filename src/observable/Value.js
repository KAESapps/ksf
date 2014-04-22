define([
	"./StatefulFactory",
	'./model/Value',
], function(
	StatefulFactory,
	ValueModel
){
	return new StatefulFactory(new ValueModel()).ctr;
});