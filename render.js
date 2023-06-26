/* jshint node: true */

"use strict";

var merge = require('merge');
var jade = require('jade');

/**
 * Function to pass default option to the response render function
 * @param responseObject res
 * @param string template
 * @param template options
 * @param object session
 */
function render(res, template, options, session){
	var activePages = null;
	if(res.activePages === undefined){
		activePages = res.get('activePages');
	}
	else{
		activePages = res.activePages;
	}

	var navOptions = {
		activePages: activePages,
		pageWidth: (100 / (activePages === undefined ? 0 : activePages.length)) + '%'
	};
	this.res = res;
	this.template = template;
	this.session = session;
	this.options = merge(navOptions, options);

	if (typeof (this.session) === 'object' && typeof(this.session.accessLevel) === 'number') {
		this.options.user = {};
		this.options.user.accessLevel = this.session.accessLevel;
	}
}

/**
 * Function to call render on the response object
 */
render.prototype.render = function (){
	if (!this.options.resources) {
		this.options.resources = {};
	}

	this.res.render(this.template, this.options);
};

/**
 *  Function to call jade renderFile on a jade file
 * @return string
 */
render.prototype.html = function () {
	if(!this.options.resources){
		this.options.resources = {};
	}

	return jade.renderFile('views/' + this.template + '.jade', this.options);
};

module.exports = render;
