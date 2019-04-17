(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['saved'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "";
},"3":function(container,depth0,helpers,partials,data) {
    return "disabled";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"card none ad-result\" id=\"fav-result-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\r\n    <div class=\"card-body row\">\r\n        <div class=\"col-5 flex\">\r\n            <div class=\"mr-4 display-7\">\r\n                <span class=\"fas fa-flag\">\r\n                    </span>\r\n            </div>\r\n            <input type=\"text\" class=\"form-control\" id=\"nickname-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.nickname || (depth0 != null ? depth0.nickname : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nickname","hash":{},"data":data}) : helper)))
    + "\" placeholder=\"nickname\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["new"] : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "/>\r\n        </div>\r\n        <div class=\"col-5 flex\">\r\n            <div class=\"mr-4 display-7\">\r\n                <span class=\"fas fa-map-marker-alt\">\r\n                </span>\r\n            </div>\r\n            \r\n            <input type=\"text\" class=\"form-control\" id=\"address-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.address || (depth0 != null ? depth0.address : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data}) : helper)))
    + "\" placeholder=\"address\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["new"] : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "/>\r\n        </div>\r\n        <div class=\"col-2 flex\">\r\n            <div class=\"display-7\">\r\n                <span id=\"save-btn-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" class=\"p-2 clickable far fa-save\"></span>\r\n            </div>\r\n            <div class=\"display-7\">\r\n                <span id=\"edit-btn-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" class=\"p-2 clickable fas fa-edit\"></span>\r\n            </div>\r\n            <div class=\"display-7\">\r\n                <span id=\"delete-btn-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" class=\"p-2 clickable fas fa-trash-alt\"></span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});
})();