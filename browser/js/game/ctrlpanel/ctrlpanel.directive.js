app.directive('ctrlpanel', function (PlayerFactory) {

    return {
        restrict: 'E',
        templateUrl: '/js/game/ctrlPanel/ctrlpanel.html',
        scope: {
        	game: '=',
          player: '='
        },
        controller: 'CtrlPanelCtrl'
    }
});


app.directive('draggable', function(){
  return function(scope, element){
    var el = element[0];
    el.draggable = true;
    el.addEventListener('dragstart', function(ev){
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('Text', this.attributes['carddata'].value);
      this.classList.add('drag');
      return false;
    }, false);
  }
});

app.directive('droppable', function(){
  return {
    scope: {
      game: '=',
      player: '='
    },
    link: function(scope, element, attrs){
      var el = element[0];
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
        if(!this.hasChildNodes()){
          if(ev.stopPropagation) ev.stopPropagation();

          var cardId = ev.dataTransfer.getData('Text');
          var handCard = document.querySelectorAll('[carddata="' + cardId + '"]')[0];

          this.classList.remove('empty');

          //add image to register
          var item = document.createElement('img');
          var prior = document.createElement('span');
          item.src = "/img/cards/" + programCards[cardId/10-1].name + ".png"
          // item.height = 110;
          // item.width = 75;

          prior.classList.add('card-priority');
          prior.appendChild(document.createTextNode(cardId));

          attrs.$set('carddata', cardId);

          this.appendChild(item);
          this.appendChild(prior);

          handCard.setAttribute('carddata', '0');
          handCard.removeChild(handCard.childNodes[0]);
          handCard.removeChild(handCard.childNodes[1]);
          handCard.classList.add('empty');
          return false;
        }
      }, false);
    }
  }
})