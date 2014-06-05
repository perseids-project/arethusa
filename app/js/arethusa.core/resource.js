'use strict';
// A newable factory that spawns new resource
// objects, whichare a wrapper around ngResource
//
// Note that this approach right now doesn't work with totally freeform URL passed
// as route, because ngResource will always encode slashes.
// There is a pending issue for this https://github.com/angular/angular.js/issues/1388
//
// As it's not a top priority right now, we don't do anything. The quickest workaround
// (apart from patching angular) would be to fall back to $http.get()
//
angular.module('arethusa.core').factory('Resource', [
  '$resource',
  '$location',
  '$cookies',
  function ($resource, $location,$cookies) {
    function paramsToObj(params) {
      return arethusaUtil.inject({}, params, function (obj, param, i) {
        obj[param] = $location.search()[param];
      });
    }

    function isJson(header) {
      if (header) return header.match('json');
    }

    function collectedParams(a, b) {
      return angular.extend(paramsToObj(a), b) || {};
    }

    return function (conf,auth) {
      var self = this;
      this.route = conf.route;
      this.params = conf.params || [];
      this.auth = auth || {};
      // if the authorization config for this resource has a
      // ping method configured, use it to initialize the cookies
      if (self.auth.ping) {
        var ping = $resource(self.auth.ping, null, { });
        // TODO should really have some error handling here
        // because if the ping fails the subsequent get and post
        // requests on the resource will
        ping.get();
      }
      this.resource = $resource(self.route, null, {
        get: {
          method: 'GET',
          transformResponse: function (data, headers) {
            var res = {};
            res.data = isJson(headers()['content-type']) ? JSON.parse(data) : data;
            res.headers = headers;
            res.source = 'tbd';
            // we need to define and http interceptor
            return res;
          }
        },
        save: {
          // TODO we need save and partial save -- latter will use PATCH
          method: 'POST',
          transformRequest: function(data,headers) {
            // TODO this should really be handled by an auth object 
            if (self.auth.type == 'CSRF') {
                headers()[self.auth.header] = $cookies[self.auth.cookie];
                headers()["Content-Type"] = self.mimetype;
            }
            return data;
          }
        }
      });

      this.get = function (otherParams) {
        var params = collectedParams(self.params, otherParams);
        return self.resource.get(params).$promise;
      };

      this.save = function (data,mimetype) {
        var params = collectedParams(self.params,{});
        self.mimetype = mimetype;
        return self.resource.save(params,data).$promise;
      };

    };
  }
]);
