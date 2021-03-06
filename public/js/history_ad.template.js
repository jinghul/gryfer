(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['history_ad'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div id=\"history-result-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" class=\"card none ad-result clickable\">\r\n    <div class=\"card-body row\">\r\n        <div class=\"col-6\">\r\n            <ul class=\"list-group\">\r\n                <li class=\"list-group-item flex\">\r\n                    <div>\r\n                        <span class=\"to-place fas fa-map-marker-alt input-group-text\"></span>\r\n                    </div>\r\n                    <div>"
    + alias4(((helper = (helper = helpers.from || (depth0 != null ? depth0.from : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"from","hash":{},"data":data}) : helper)))
    + "</div>\r\n                </li>\r\n                <li class=\"list-group-item flex\">\r\n                    <div>\r\n                        <span class=\"from-place fas fa-map-marker-alt input-group-text\"></span>\r\n                    </div>\r\n                    <div>\r\n                        "
    + alias4(((helper = (helper = helpers.to || (depth0 != null ? depth0.to : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"to","hash":{},"data":data}) : helper)))
    + "\r\n                    </div>\r\n                </li>\r\n            </ul>\r\n        </div>\r\n        <div class=\"col-6\"><span class=\"price-display display-5\">"
    + alias4(((helper = (helper = helpers.price || (depth0 != null ? depth0.price : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"price","hash":{},"data":data}) : helper)))
    + "</span>\r\n            <span class=\"date-display lead\">Completed "
    + alias4(((helper = (helper = helpers.time || (depth0 != null ? depth0.time : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"time","hash":{},"data":data}) : helper)))
    + " "
    + alias4(((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"date","hash":{},"data":data}) : helper)))
    + "</span>\r\n            <div class=\"w-100 flex\">\r\n                <div class=\"mx-auto\" style=\"display:inline-block\"><select id=\"rate-ride-"
    + alias4(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\r\n                    <option value=\"1\">1</option>\r\n                    <option value=\"2\">2</option>\r\n                    <option value=\"3\">3</option>\r\n                    <option value=\"4\">4</option>\r\n                    <option value=\"5\">5</option>\r\n                </select></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});
})();