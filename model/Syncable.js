define([
	"dojo/when",
	'../collections/Dict',
	"collections/shim-object",
], function(
	when,
	Dict
){
	var Syncable = function(args){
		// default values
		this.syncIdProperty = "id";
		this.getSyncId = function(rsc){
			return this.getPropValue(rsc, this.syncIdProperty);
		};
		this.lastSourceDataProperty = "lastSourceData";
		this.inSyncProperty = "inSync";
		this.getResponse2Data = function(response){
			return response;
		};
		this.putResponse2Id = function(response){
			return response[this.syncIdProperty];
		};
		this.putResponse2Data = function(response){
			return response;
		};

		this.getSourceData = function(rsc) {
			return this.logRequest(rsc, "get", this.dataSource.get(this.getSyncId(rsc)));
		};
		this.putSourceData = function(rsc, data) {
			var options = {};
			var id = this.getSyncId(rsc);
			if (id) {options.id = id;}
			return this.logRequest(rsc, "put", this.dataSource.put(data, options));
		};
		this.deleteSourceData = function(rsc){
			return this.logRequest(rsc, "delete", this.dataSource.remove(this.getSyncId(rsc)));
		};
		this.logRequest = function(rsc, type, result) {
			var status = new Dict({
				type: type,
				started: new Date(),
				stage: "inProgress",
				finished: null,
				response: null,
				// request: result,
			});
			this.setPropValue(rsc, "lastRequestStatus", status);

			result.then(function(response){
				status.setEach({
					stage: "success",
					response: response,
					finished: new Date(),
				});
				return response;
			}, function(response){
				status.setEach({
					stage: "error",
					response: response,
					finished: new Date(),
				});
				return response;
			});
			return result;
		};

		this.isInSync = function(rsc){
			var localState = this.serialize(rsc);
			var remoteState = this.getPropValue(rsc, this.lastSourceDataProperty);
			remoteState = remoteState && remoteState.data;
			return Object.equals(localState, remoteState);
		};
		this.refreshSyncStatus = function(rsc){
			if (!this.disableRefreshSyncStatus){
				this.setPropValue(rsc, this.inSyncProperty, this.isInSync(rsc));
			}
		};
		var setEachPropValue = this.setEachPropValue;
		this.setEachPropValue = function(rsc, values){
			// don't refresh sync status for each prop but do it only once
			this.disableRefreshSyncStatus = true;
			setEachPropValue.apply(this, arguments);
			this.disableRefreshSyncStatus = false;
			this.refreshSyncStatus(rsc);
		};

		var create = this.create;
		this.create = function(args){
			var mng = this;
			// call inherited
			var rsc = create.call(this, args);
			// add methods on rsc
			rsc.fetch = function(){
				return mng.fetch(rsc);
			};
			rsc.push = function(){
				return mng.push(rsc);
			};
			rsc.pull = function(){
				return mng.pull(rsc);
			};
			rsc.merge = function(){
				return mng.merge(rsc);
			};
			return rsc;
		};

		this.fetch = function(rsc){
			var result = this.getSourceData(rsc);
			result.then(function(response){
				var data = this.getResponse2Data(response);
				this.setPropValue(rsc, this.lastSourceDataProperty, {
					time: new Date(),
					data: data,
				});
				return response;
			}.bind(this));
			return result;
		};
		this.merge = function(rsc, options){
			this.deserialize(rsc, this.getPropValue(rsc, this.lastSourceDataProperty).data, options);
		};
		this.push = function(rsc, options){
			var data = this.serialize(rsc);
			var dfd = this.putSourceData(rsc, data);
			dfd.then(function(response){
				var id = this.putResponse2Id(response);
				var responseData = this.putResponse2Data(response);
				id && this.setPropValue(rsc, this.syncIdProperty, id);
				// the default behavior is to update lastSourceData after a successfull put either with the response data or with the local data. This way, we don't need a fetch request.
				if (!options || !options.preventLastSourceDataUpdate) {
					this.setPropValue(rsc, this.lastSourceDataProperty, {
						time: new Date(),
						data: responseData ? responseData : data,
					});
				}
				return response;
			}.bind(this));
			return dfd;
		};
		this.pull = function(rsc){
			var fetchResult = this.fetch(rsc);
			fetchResult.then(function(){
				this.merge(rsc);
			}.bind(this));
			return fetchResult;
		};


	};
	return Syncable;
});