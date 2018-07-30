module.exports = function(application){
    "use strict";
    application.controller("MainContentCtrl",["$scope","$routeParams","navigate","dataBlock","$location","$timeout",
        function($scope,$routeParams,navigate,dataBlock,$location,$timeout){
        "use strict";
        function scroll(e,args){
            var title = args[0];
            var elem = angular.element(document.getElementById(title));
            var container = angular.element(document.getElementById("mainContent"));
            container.scrollToElement(elem,50,120);
        }
        $scope.data={};
        var elem = angular.element(document.getElementById("mainContent"));
        if (!navigate.urlIsValid($routeParams)){
            console.log("not a valid URL");
            navigate.errorPage();
        }
        $scope.showLicense = /\/about\//.test($location.path());
        console.log(`We are currently on the about page: ${$scope.showLicense}`);
        var data = navigate.getDataBlock();
        $scope.$emit("$dataWasLoaded",data[0]);
        $scope.data = data[0];
        $scope.index = data[1];
        $scope.blockLength = navigate.getBlockLength();
        $scope.blockName = navigate.getBlockName();
        
        //here, we check if there is a hash in the url (there always is a hash in the url when coming from search
            // then if there is, we find the element and then scroll to it using the scroll CDN
        if (!$location.hash()){
            elem.scrollTop(0,0);
        }
        else{
            $timeout(function(){
                scroll(null,[$location.hash()]);
            },200);
        }
        //also, when a button is pressed in the right-side menu, event 'ifsScrollTo' fires up, we bind function scroll to that event
        $scope.$on("ifsScrollTo",scroll);
    }]);
};
