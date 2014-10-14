define([
	'rest/browser',
	'rest/interceptor/mime',
	'rest/interceptor/errorCode',
], function(
	rest,
	mime,
	errorCode
) {
	return rest.wrap(mime, { mime: 'application/x-www-form-urlencoded'}).wrap(errorCode, { code: 400 });
});