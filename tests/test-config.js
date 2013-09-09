define(['../require-config'], function(loaderConfig) {
	return {
		// Configuration options for the module loader; any AMD configuration options supported by the Dojo loader can be
		// used here
		loader: loaderConfig,

		// Non-functional test suite(s) to run in each browser
		suites: [
			'ksf/utils/tests/all',
			'ksf/base/tests/all',
			'ksf/collections/tests/all',
			'ksf/components/tests/all',
			'ksf/dom/tests/all',
			'ksf/model/demo/resources-manager-demo',
		]
	};
});