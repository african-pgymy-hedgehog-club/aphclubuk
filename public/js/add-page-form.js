this["JST"] = this["JST"] || {};

this["JST"]["views/client/add-page-form"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (pages, undefined) {
var jade_indent = [];
buf.push("\n<div class=\"uk-modal-header\">Add Page</div>\n<form id=\"add-page\" class=\"uk-form uk-form-horizontal\">\n  <div class=\"uk-form-row\">\n    <label class=\"uk-form-label\">Name</label>\n    <div class=\"uk-form-controls\">\n      <input type=\"text\" name=\"name\"/>\n    </div>\n  </div>\n  <div class=\"uk-form-row\">\n    <label class=\"uk-form-label\">Parent</label>\n    <div class=\"uk-form-controls\">\n      <select name=\"parent\">\n        <option value=\"null\">None</option>");
// iterate pages
;(function(){
  var $$obj = pages;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var page = $$obj[$index];

buf.push("\n        <option" + (jade.attr("value", "" + page._id, true, false)) + ">" + (jade.escape(null == (jade_interp = page.name) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var page = $$obj[$index];

buf.push("\n        <option" + (jade.attr("value", "" + page._id, true, false)) + ">" + (jade.escape(null == (jade_interp = page.name) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("\n      </select>\n    </div>\n  </div>\n  <div class=\"uk-form-row\">\n    <label class=\"uk-form-label\">Active</label>\n    <div class=\"uk-form-controls\">\n      <input type=\"checkbox\" name=\"active\"/>\n    </div>\n  </div>\n  <div class=\"uk-form-row\">\n    <button class=\"uk-button uk-button-primary uk-float-right\">Save Page</button>\n  </div>\n</form>");}.call(this,"pages" in locals_for_with?locals_for_with.pages:typeof pages!=="undefined"?pages:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};