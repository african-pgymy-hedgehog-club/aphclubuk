this["JST"] = this["JST"] || {};

this["JST"]["views/client/add-show-form"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

var jade_indent = [];
buf.push("\n<div class=\"uk-modal-header\">Add Show</div>\n<form id=\"add-show\" class=\"uk-form uk-form-horizontal\">\n  <div class=\"uk-form-row\">\n    <label class=\"uk-form-label\">Name</label>\n    <div class=\"uk-form-controls\">\n      <input type=\"text\" name=\"name\"/>\n    </div>\n  </div>\n  <div class=\"uk-form-row\">\n    <label class=\"uk-form-label\">Location</label>\n    <div class=\"uk-form-controls\">\n      <textarea type=\"text\" name=\"location\" rows=\"4\" cols=\"20\"></textarea>\n    </div>\n  </div>\n  <div class=\"uk-form-row\">\n    <label class=\"uk-form-label\">Date</label>\n    <div class=\"uk-form-controls\">\n      <input type=\"text\" name=\"date\" data-uk-datepicker='{\"format\":\"DD/MM/YYYY\"}' readonly=\"readonly\"/>\n    </div>\n  </div>\n  <div class=\"uk-form-row\">\n    <label class=\"uk-form-label\">Time</label>\n    <div class=\"uk-form-controls\">\n      <input type=\"text\" name=\"time\" data-uk-timepicker=\"{format: '12h'}\" readonly=\"readonly\"/>\n    </div>\n  </div>\n  <div class=\"uk-form-row\">\n    <button class=\"uk-button uk-button-primary uk-float-right\">Save Show</button>\n  </div>\n</form>");;return buf.join("");
};