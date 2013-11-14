define([

], function(

){
	var WithUpdateSyncStatus = function(){
		var setValue = this.setValue;
		this.setValue = function(rsc){
			setValue.apply(this, arguments);
			this.owner.refreshSyncStatus(rsc);
		};
	};
	return WithUpdateSyncStatus;
});