module.exports = function(application){
  "use strict";
  application.factory("github",["$resource",function($resource){
    "use strict";
    //when we get data, we receive an array, therefore we have to specify isArray in the resource method definition
    var resource = $resource("/github",null,{
      'query': {method: 'GET', isArray:true},
      'get': {method: 'GET',params: {connection:false}},
      'avail': {method: 'GET',params: {available: true}}
    });
    var resource_auth = $resource("/github/auth",{
      'get' : {method: 'GET'}
    });
    var resource_local = $resource("/auth",{
      'post': {method: 'POST'},
      'get': {method: 'GET'}
    });
    var download_resource = $resource("/download");
    var authenticated = false;
    return{
      get: function(conn){
        
        return resource.get({connection: conn});
      },
      getConnectionUrl: function(){
        return resource.get({connection: true})
      },
      post: function(){
        return resource_auth.get();
      },
      authLocal: function(form){
        return resource_local.save(null,form);
      },
      authAvailable: function(){
        console.log("Have to find out from the server");
        return resource_local.get();
      
      },
      gitAvailable: function(){
        console.log("Have to find out from the server if github is avaialble");
        return resource.avail();
        
      },
      download: function(){
        console.log("Downloading");
        return download_resource.get();
      },
      authenticated: authenticated
    }
  }]);
};
