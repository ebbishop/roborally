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