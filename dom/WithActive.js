define([

], function(

){
	var WithActiveGenerator = function(domEvent){
		var mixin = function() {
			this.get('domNode').addEventListener(domEvent, function(){
				this.set("active", !this.get("active"));
			}.bind(this));

		};
		mixin.prototype = {
			_activeSetter: function(value){
				this._active = !!value;
				if (value){
					// this.style.set('active', 'active');
					this.get('domNode').classList.add('active');
				} else {
					// this.style.remove('active');
					this.get('domNode').classList.remove('active');
				}
			},
			_activeGetter: function(){
				return this._active;
			},
		};
		return mixin;
	};

	var WithActive = WithActiveGenerator('click');
	WithActive.create = WithActiveGenerator;
	return WithActive;
});