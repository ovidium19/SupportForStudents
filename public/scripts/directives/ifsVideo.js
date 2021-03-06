module.exports = function(application){
    "use strict";
    application.directive("ifsVideo",["$window","$timeout",
        function($window,$timeout){
        "use strict";
        // noinspection JSAnnotator
        return {
            restrict: "E",
            
            template: require('../../templates/components/video/single.html'),
            scope: {
                element: "=",
                start: "="
            },
            link: function(scope,elem){
                var img = $(elem).find("img");
                img.on("load",function(e){
                    console.log("image was loaded");
                    console.log(e);
                });
                img.on("error",function(e){
                    console.log("error detected");
                    console.log(e);
                    if (e.currentTarget.attributes.src.value){
                      console.log("Error loading image");
                      console.log(e);
                    }
                 
                });
                scope.$on("stopVideo",function(e,v){
                    e.preventDefault();
                    if (scope.videoPlaying){
                        var src = $(scope.iframe).attr("src");
                        $(scope.iframe).attr("src",src);
                        scope.$apply(function(){
                            scope.videoPlaying = false;
                        });
                    }
                });
                scope.setFrameParams = function(){
                    $timeout(function(){
                        scope.iframe=$(elem).find("iframe");
                        console.log(scope.iframe);
                        var width = $(window).width();
                        if (width > 930){
                            scope.iframe.css("width","600px");
                            scope.iframe.css("height","335px");
                        }
                        else if (width<=930){
                            scope.iframe.css("width","390px");
                            scope.iframe.css("height","218px");
                        }
                        
                        $(window).resize(function(e){
                            var width = $(this).width();
                            if (width > 930){
                                
                                scope.iframe.css("width","600px");
                                scope.iframe.css("height","335px");
                            }
                            else if (width<=930){
                                scope.iframe.css("width","390px");
                                scope.iframe.css("height","218px");
                            }
                        });
                    });
                    
                };
                
            },
            controller: function($scope,$sce){
                if ($scope.element.video){
                    $scope.link = $sce.trustAsResourceUrl($scope.element.video.src);
                }
               
                $scope.videoPlaying=false;
                $scope.openVideo = function(){
                    $scope.videoPlaying= !$scope.videoPlaying;
                    if ($scope.videoPlaying){
                        $scope.setFrameParams();
                    }
                };
                if ($scope.start){
                    $timeout(function(){
                        $scope.openVideo();
                    },0);
                }
            }
        }
    }]);
};
