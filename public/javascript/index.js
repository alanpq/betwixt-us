const dom_roomID = document.getElementById('room-code');
const dom_name = document.getElementById('name');
const dom_error = document.getElementById('error');
dom_name.value = localStorage.getItem("name") || "";

const connect = (code) => {
  console.log(`Moving to game room ${code}`)
  localStorage.setItem("name", dom_name.value);
  sessionStorage.setItem('code', code);
  window.location = '/game';
}

const joinRoom = () => {
  dom_error.innerText = "";
  dom_error.className = "";
  if (dom_roomID.validity.valid && dom_name.validity.valid)
    fetch(`/room/${dom_roomID.value.toUpperCase()}`).then(res => res.json())
      .then(
        json => {
          console.log(json)
          if (json.status == 200)
            connect(dom_roomID.value.toUpperCase());
          else {
            dom_error.innerText = `Invalid Room Code.`
            dom_error.className = "active";
          }
        }
      );
  else {
    dom_error.innerHTML = `
      ${dom_name.validity.valid ? "" : "Name:"}${dom_name.validationMessage}<br>
      ${dom_roomID.validity.valid ? "" : "Room ID:"} ${dom_roomID.validationMessage}
    `
    dom_error.className = "active";
  }
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