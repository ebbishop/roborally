app.directive('board', function ($parse) {
  return {
    template: '<table><tr ng-repeat="col in board"><td ng-repeat="tile in col track by $index"><img src="/img/tiles/{{tile}}.jpg"></td></tr></table>',
    restrict: 'E',
    scope: {board: '='},
    controller: function postLink($scope, $element, $attrs) {
      var stage = new PIXI.Stage(0x66ff99);
      var renderer = new PIXI.CanvasRenderer(640,480);
      $scope.renderPlz = function(){
        console.log('renderPlz')
        renderer.render(stage);
      }

    },
    link: function(scope){
      console.log('link')
      scope.renderPlz()
    }
  };
});
