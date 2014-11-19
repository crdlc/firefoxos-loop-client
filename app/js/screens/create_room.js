'use strict';

(function(exports) {

  var panel, roomNameInput, saveButton;

  var _ = navigator.mozL10n.get;

  function render() {
    if (panel) {
      return;
    }

    panel = document.getElementById('new-room');
    panel.innerHTML = Template.extract(panel);
    roomNameInput = panel.querySelector('input');
    saveButton = panel.querySelector('#save-room-action');
    roomNameInput.placeholder = _('roomNamePlaceHolder');
  }

  function show(cb) {
    panel.classList.remove('hide');
    // We emit this event to center properly the header
    window.dispatchEvent(new CustomEvent('lazyload', {
      detail: panel
    }));
    // Allow UI to be painted before launching the animation
    setTimeout(() => {
      panel.addEventListener('transitionend', function onTransitionEnd() {
        panel.removeEventListener('transitionend', onTransitionEnd);
        typeof cb === 'function' && cb();
      });
      panel.classList.add('show');
    }, 50);
  }

  function hide() {
    panel.addEventListener('transitionend', function onTransitionEnd() {
      panel.removeEventListener('transitionend', onTransitionEnd);
      removeHandlers();
      panel.classList.add('hide');
    });
    panel.classList.remove('show');
  }

  function checkSaveButton() {
    saveButton.disabled = roomNameInput.value.trim() === '';
  }

  function clearRoomName(evt) {
    evt && evt.preventDefault();
    roomNameInput.value = '';
    checkSaveButton();
  }

  function save() {
    if (!navigator.onLine) {
      LazyLoader.load('js/screens/error_screen.js', () => {
        OfflineScreen.show(_('noConnection'));
      });
      return;
    }

    removeHandlers();
    LazyLoader.load('js/helpers/rooms.js', () => {
      var params = {
        roomName: roomNameInput.value.trim(),
        expiresIn: Config.rooms.expiresIn,
        roomOwner: Controller.identity,
        maxSize: Config.rooms.maxSize
      };

      console.log(JSON.stringify(params));

      Rooms.create(params).then((roomToken) => {
        hide();
      }, (error) => {
        // TODO error handling
        console.error(JSON.stringify(error));
      });
    });
  }

  function attachHandlers() {
    panel.querySelector('.icon-close').addEventListener('click', hide);
    panel.querySelector('#save-room-action').addEventListener('click', save);
    panel.querySelector('#room-name-clear').addEventListener('touchstart',
                                                              clearRoomName);
    panel.querySelector('form').addEventListener('input', checkSaveButton);
  }

  function removeHandlers() {
    panel.querySelector('.icon-close').removeEventListener('click', hide);
    panel.querySelector('#save-room-action').removeEventListener('click', save);
    panel.querySelector('#room-name-clear').removeEventListener('touchstart',
                                                                 clearRoomName);
    panel.querySelector('form').removeEventListener('input', checkSaveButton);
  }

  exports.RoomCreate = {
    show: () => {
      render();
      clearRoomName();
      show(attachHandlers);
    }
  };;

}(window));
