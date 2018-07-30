module.exports = function(application){
  "use strict";
  application.directive("creativeCommonsLicense",function(){
    "use strict";
    return{
      restrict: "E",
      scope: {
      
      },
      template: require('../../templates/license.html'),
      link: function(scope,elem,attrs,ctrl){
      
      },
      controller: function($scope){
      
      }
    }
  });
};
