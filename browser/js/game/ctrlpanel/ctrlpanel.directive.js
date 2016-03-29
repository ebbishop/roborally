var programCards = [
               { name: 'u',  priority: 10 },
               { name: 'u',  priority: 20 },
               { name: 'u',  priority: 30 },
               { name: 'u',  priority: 40 },
               { name: 'u',  priority: 50 },
               { name: 'u',  priority: 60 },
               { name: 'l', priority: 70 },
               { name: 'r',  priority: 80 },
               { name: 'l', priority: 90 },
               { name: 'r',  priority: 100 },
               { name: 'l', priority: 110 },
               { name: 'r',  priority: 120 },
               { name: 'l', priority: 130 },
               { name: 'r',  priority: 140 },
               { name: 'l', priority: 150 },
               { name: 'r',  priority: 160 },
               { name: 'l', priority: 170 },
               { name: 'r',  priority: 180 },
               { name: 'l', priority: 190 },
               { name: 'r',  priority: 200 },
               { name: 'l', priority: 210 },
               { name: 'r',  priority: 220 },
               { name: 'l', priority: 230 },
               { name: 'r',  priority: 240 },
               { name: 'l', priority: 250 },
               { name: 'r',  priority: 260 },
               { name: 'l', priority: 270 },
               { name: 'r',  priority: 280 },
               { name: 'l', priority: 290 },
               { name: 'r',  priority: 300 },
               { name: 'l', priority: 310 },
               { name: 'r',  priority: 320 },
               { name: 'l', priority: 330 },
               { name: 'r',  priority: 340 },
               { name: 'l', priority: 350 },
               { name: 'r',  priority: 360 },
               { name: 'l', priority: 370 },
               { name: 'r',  priority: 380 },
               { name: 'l', priority: 390 },
               { name: 'r',  priority: 400 },
               { name: 'l', priority: 410 },
               { name: 'r',  priority: 420 },
               { name: 'backup', priority: 430 },
               { name: 'backup', priority: 440 },
               { name: 'backup', priority: 450 },
               { name: 'backup', priority: 460 },
               { name: 'backup', priority: 470 },
               { name: 'backup', priority: 480 },
               { name: 'f1', priority: 490 },
               { name: 'f1', priority: 500 },
               { name: 'f1', priority: 510 },
               { name: 'f1', priority: 520 },
               { name: 'f1', priority: 530 },
               { name: 'f1', priority: 540 },
               { name: 'f1', priority: 550 },
               { name: 'f1', priority: 560 },
               { name: 'f1', priority: 570 },
               { name: 'f1', priority: 580 },
               { name: 'f1', priority: 590 },
               { name: 'f1', priority: 600 },
               { name: 'f1', priority: 610 },
               { name: 'f1', priority: 620 },
               { name: 'f1', priority: 630 },
               { name: 'f1', priority: 640 },
               { name: 'f1', priority: 650 },
               { name: 'f1', priority: 660 },
               { name: 'f2', priority: 670 },
               { name: 'f2', priority: 680 },
               { name: 'f2', priority: 690 },
               { name: 'f2', priority: 700 },
               { name: 'f2', priority: 710 },
               { name: 'f2', priority: 720 },
               { name: 'f2', priority: 730 },
               { name: 'f2', priority: 740 },
               { name: 'f2', priority: 750 },
               { name: 'f2', priority: 760 },
               { name: 'f2', priority: 770 },
               { name: 'f2', priority: 780 },
               { name: 'f2', priority: 790 },
               { name: 'f3', priority: 800 },
               { name: 'f3', priority: 810 },
               { name: 'f3', priority: 820 },
               { name: 'f3', priority: 830 },
               { name: 'f3', priority: 840 } ];


app.directive('ctrlpanel', function (PlayerFactory) {

    return {
        restrict: 'E',
        templateUrl: '/js/game/ctrlPanel/ctrlpanel.html',
        scope: {
        	game: '=',
          player: '='
        },
        // controller: 'CtrlPanelCtrl',
        link: function(scope){
          console.log('this is the scope in directive:', scope)

          function chop(arr){
            var cards = arr.map(function(c){
              return programCards[(c/10)-1]
            });
            var chopped = [];
            var subArr = [];
            for (var i = 0; i < arr.length; i++){
              subArr.push(programCards[arr[i]/10 - 1]);
              if(subArr.length === 3){
                chopped.push(subArr);
                subArr = [];
              }
            }
            console.log(chopped);
            return chopped;
          }

          scope.cards = chop([100, 340, 720, 10, 200, 820, 700, 530, 610]);

          scope.register = [100, 340, 720, 10, 200];

          scope.sendRegister = function(register, gameId, playerId) {
            return PlayerFactory.sendRegister(scope.register, scope.game._id, scope.player._id)
            .then(function(response) {
              console.log('send register response:' ,response)
            })
          }

        }
    }
});


app.directive('draggable', function(){
  return function(scope, element){
    var el = element[0];
    el.draggable = true;

    el.addEventListener('dragstart', function(ev){
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('Text', el.attributes['carddata'].value);
      this.classList.add('drag');
      return false;
    }, false);

    // el.addEventListener('dragend', function(ev){
    //   this.classList.remove('drag');
    //   return false;
    // }, false);
  }
});

app.directive('droppable', function(){
  return {
    scope: {},
    link: function(scope, element){
      var el = element[0];
      el.droppable = true;

      el.addEventListener('dragover', function(ev){
        ev.dataTransfer.dropEffect = 'move';
        if(ev.preventDefault) ev.preventDefault();
        this.classList.add('over');
        return false;
      }, false);

      el.addEventListener('dragenter', function(ev) {
        this.classList.add('over');
        return false;
      }, false);

      el.addEventListener('dragleave', function(ev) {
        this.classList.remove('over');
        return false;
      }, false);

      el.addEventListener('drop', function(ev){
        if(this.droppable){
          if(ev.stopPropagation) ev.stopPropagation();
          this.classList.remove('over');

          var cardId = ev.dataTransfer.getData('Text');
          this.carddata = cardId;

          //add image to register
          var item = document.createElement('img');
          item.src = "/img/cards/" + programCards[cardId/10-1].name + ".png"
          item.height = 100;
          item.width = 70;
          this.appendChild(item);
          this.droppable = false;


          var handCard = document.querySelectorAll('[carddata="' + cardId + '"]')[0];
          handCard.removeAttribute('carddata');
          handCard.removeChild(handCard.childNodes[0]);
          handCard.classList.add('empty');
          handCard.addAttribute('droppable');
          handCard.droppable = true;
          // handCard.removeAttribute('draggable');
          // handCard.addAttribute('droppable');
          return false;
        }
      }, false);
    }
  }
})