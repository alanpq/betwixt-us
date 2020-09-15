/** @type {SocketIO.Socket} */
export const socket = io('/' + sessionStorage.getItem('code'), {
    autoConnect: false,
});
console.log(`Connecting to room '${sessionStorage.getItem('code')}'`);