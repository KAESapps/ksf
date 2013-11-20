define([], function(){
	return {
		fromLiteral: function(item) {
			return (item instanceof Array) ? {
				element: item[0],
				options: item[1]
			} : {
				element: item,
				options: {}
			};
		}
	};
});