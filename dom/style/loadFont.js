/*jshint multistr: true */
var insertCss = require('insert-css');
module.exports = function(fontData, name, options) {
	options = options || {};
	var format = options.format || 'woff',
		weight = options.weight || 'normal',
		style = options.style || 'normal';

	insertCss('@font-face { \
	    font-family: "'+ name +'"; \
	    src: url(data:application/octet-stream;base64,' + fontData + ') format("' + format + '"); \
	    font-weight: ' + weight + '; \
	    font-style: ' + style + '; \
	}');
	return name;
};