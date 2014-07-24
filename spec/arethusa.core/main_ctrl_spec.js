"use strict";

describe('MainCtrl', function() {
  beforeEach(module('arethusa'));

  it('sets scope values', inject(function($controller, $rootScope) {
    var scope = $rootScope.$new();

    var state = {
      init: function() {},
      allLoaded: false
    };

    var mainCtrlInits = {
      $scope: scope,
      configurator: arethusaMocks.configurator({
        configurationFor: function () {
          return { template: "template", plugins: {} };
        }
      }),
      state: state,
      notifier: arethusaMocks.notifier(),
      saver: arethusaMocks.saver(),
      keyCapture: arethusaMocks.keyCapture(),
      history: arethusaMocks.history()
    };

    var ctrl = $controller('MainCtrl', mainCtrlInits);

    expect(scope.state).toBe(state);
    expect(scope.plugins).toBeUndefined();
    expect(scope.template).toBe("template");
  }));
});
