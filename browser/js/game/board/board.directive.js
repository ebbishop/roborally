app.directive('board', function ($parse) {
  return {
    template: '<table><tr ng-repeat="col in board"><td ng-repeat="tile in col track by $index"><img src="/img/tiles/{{tile}}.jpg"></td></tr></table>',
    restrict: 'E',
    scope: {board: '='}
  };
});
