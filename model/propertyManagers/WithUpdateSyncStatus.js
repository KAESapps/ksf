define([

], function(

){
	var WithUpdateSyncStatus = function(){
		var set = this.set;
		this.set = function(rsc){
			set.apply(this, arguments);
			this.owner.refreshSyncStatus(rsc);
		};
	};
	return WithUpdateSyncStatus;
});