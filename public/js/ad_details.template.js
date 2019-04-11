(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['ad_details'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<ul class=\"list-group\" "
    + alias4(((helper = (helper = helpers.body_style || (depth0 != null ? depth0.body_style : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"body_style","hash":{},"data":data}) : helper)))
    + ">\r\n    <li class=\"list-group-item flex\" "
    + alias4(((helper = (helper = helpers.first_style || (depth0 != null ? depth0.first_style : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"first_style","hash":{},"data":data}) : helper)))
    + ">\r\n        <div>\r\n            <span class=\"to-place list-icon fas fa-map-marker-alt input-group-text\"></span>\r\n        </div>\r\n        <div>\r\n            <span class=\"display-7\">"
    + alias4(((helper = (helper = helpers.from_loc || (depth0 != null ? depth0.from_loc : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"from_loc","hash":{},"data":data}) : helper)))
    + "</span>\r\n        </div>\r\n    </li>\r\n    <li class=\"list-group-item flex\">\r\n        <div>\r\n            <span class=\"from-place list-icon fas fa-map-marker-alt input-group-text\"></span>\r\n        </div>\r\n        <div>\r\n            <span class=\"display-7\">"
    + alias4(((helper = (helper = helpers.to_loc || (depth0 != null ? depth0.to_loc : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"to_loc","hash":{},"data":data}) : helper)))
    + "</span>\r\n        </div>\r\n    </li>\r\n    <li class=\"list-group-item flex\">\r\n        <div>\r\n            <span class=\"bg-white list-icon far fa-calendar-alt input-group-text\"></span>\r\n        </div>\r\n        <div>\r\n            <span class=\"display-7\">"
    + alias4(((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"date","hash":{},"data":data}) : helper)))
    + "</span>\r\n        </div>\r\n    </li>\r\n</ul>";
},"useData":true});
})();