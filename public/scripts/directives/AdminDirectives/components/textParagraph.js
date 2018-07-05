module.exports = function(application){
    "use strict";
    application.directive('textParagraphAdmin',["$parse",function($parse){
        return{
            restrict : 'E',
            scope:{
                item: "="
            },
            template: require('../../../../templates/admin/components/textParagraph.html'),
            link: function(scope,elem,attrs,ctrl){
                if (attrs.hasOwnProperty('formName')){
                    $(elem).find('.sub-form').attr('name',attrs['form-name']);
                }
                
            },
            controllerAs: 'ctrl',
            controller: ["links","$scope",function(links,$scope){
                if (!$scope.item){
                    $scope.item = {}
                }
                if ($scope.item.hasOwnProperty('links'))
                    this.links = $scope.item.links;
                else{
                    $scope.item.links =[];
                    this.links = $scope.item.links;
                }
                
                this.createLinks = function(){
                    $scope.item.links = [{}];
                    this.links = $scope.item.links;
                    
                };
                this.addLink = function(){
                    this.links.push({});
                }
            }]
        }
    }]);
};