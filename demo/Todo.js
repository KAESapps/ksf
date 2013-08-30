define([
	"compose",
	"ksf/collections/ObservableObject",
], function(
	compose,
	ObservableObject
){
	var Todo = compose(
		ObservableObject,
		function(args){
			this.set("text", args.text);
			this.set("done", args.done);
		},
		{
			_doneSetter: function(done){
				this._Setter('done', !!done);
			}
		}
	);

	return Todo;
});