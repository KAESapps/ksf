var compose = require('./utils/compose');

var Person = compose({
	speek: function() {
		console.log('heello');
	}
});

new Person().speek();