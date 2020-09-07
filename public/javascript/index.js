const dom_roomID = document.getElementById('room-code');
const dom_name = document.getElementById('name');
dom_name.value = localStorage.getItem("name") || "";

const connect = (code) => {
  console.log(`Moving to game room ${code}`)
  localStorage.setItem("name", dom_name.value);
  sessionStorage.setItem('code', code);
  window.location = '/game';
}

const joinRoom = () => {
  if (dom_roomID.validity.valid && dom_name.validity.valid)
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