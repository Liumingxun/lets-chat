const socket = io('localhost:5000')

function updateUserList(socketList) {
  const activeUserList = document.getElementById('user-list')

  socketList.forEach(socketId => {
    const alreadyExist = document.getElementById(socketId)
    if (!alreadyExist) {
      const userEl = document.createElement('li')
      userEl.setAttribute('id', socketId)
      userEl.textContent = socketId
      activeUserList.append(userEl)
    }
  })
}

socket.on("remove-user", ({ socketId }) => {
  const elToRemove = document.getElementById(socketId);

  if (elToRemove) {
    elToRemove.remove();
  }
})


socket.on('update-user-list', (res) => {
  const {user:userList} = res
  console.log(userList)
  updateUserList(userList)
})

const devices = navigator.mediaDevices
console.log(devices)
devices.getUserMedia({video: true, audio: true})
  .then((stream) => {
    const localVideo = document.getElementById('local-video')
    if (localVideo) localVideo.srcObject = stream
  })
  .catch(err => {
    console.error(err.message)
  })
