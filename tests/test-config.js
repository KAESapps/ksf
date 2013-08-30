define(['./require-config'], function(loaderConfig) {
	return {
		// Configuration options for the module loader; any AMD configuration options supported by the Dojo loader can be
		// used here
		loader: loaderConfig,

		// Non-functional test suite(s) to run in each browser
		suites: [
			'ksf/component/tests/all',
			'ksf/utils/tests/all'
		]
	};
});