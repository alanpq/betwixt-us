const dom_roomID = document.getElementById('room-code');

const connect = (code) => {
  console.log(`Moving to game room ${code}`)
  sessionStorage.setItem('code', code);
  window.location = '/game';
}

const joinRoom = () => {
  if (dom_roomID.validity.valid)
    fetch(`/room/${dom_roomID.value.toUpperCase()}`).then(res => res.json())
      .then(
        json => {
          console.log(json)
          connect(dom_roomID.value.toUpperCase());
        }
      );
}

const createRoom = () => {
  fetch(`/room/create/`, {
    method: 'POST'
  }).then(res => res.json()).then(
    json => {
      console.log(json);
      connect(json.code);
    }
  );
}