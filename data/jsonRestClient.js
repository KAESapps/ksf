define([
	'rest',
	'rest/interceptor/mime',
	'rest/interceptor/errorCode',
], function(
	rest,
	mime,
	errorCode
) {
	return rest.wrap(mime, { mime: 'application/json'}).wrap(errorCode, { code: 400 });
});