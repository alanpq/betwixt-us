const dom_roomID = document.getElementById('room-code');

const joinRoom = () => {
  if (dom_roomID.validity.valid)
    fetch(`/room/${dom_roomID.value.toUpperCase()}`).then(res => res.json())
      .then(
        json => console.log(json)
        // TODO: join room with this code
      );
}

const createRoom = () => {
  fetch(`/room/create/`, {
    method: 'POST'
  }).then(res => res.json()).then(
    json => console.log(json)
    // TODO: join room with code returned
  );
}