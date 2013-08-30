define([
	'bacon',
	'ksf/utils/destroy',
], function(
	Bacon,
	destroy
){
	var CONTAINER = '_component';
	var CONTENT = 'content';
	var FACTORY = '_factory';


	var WithContentMappedToContainer = function() {
		this.own(this[CONTAINER].get("content").updateContentMapR(
			this.getR(CONTENT).
			flatMapLatestDiff(null, function(oldItems, newItems){
				return newItems && newItems.asChangesStream(oldItems) ||
					(oldItems ? Bacon.constant(oldItems.toChanges("remove")) : Bacon.never());
			}),
		this[FACTORY]));

	};
	WithContentMappedToContainer.prototype.destroy = function() {
		// destroy all mapped items
		this[CONTAINER].get("content").forEach(destroy);
	};
	return WithContentMappedToContainer;
});