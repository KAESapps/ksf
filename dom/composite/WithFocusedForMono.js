define([

], function(

){
	var WithFocused = function(){
		this.whenDefined('_component', function(cmp) {
			return cmp.bind('focused', this, 'focused');
		});

	};
	return WithFocused;
});