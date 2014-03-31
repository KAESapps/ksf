define(['../Style'], function(Style) {
	return {
		load: function (name, parentRequire, onload, config) {
			parentRequire(['text!' + name], function (value) {
				onload(new Style(value));
			});
		}
	};
});