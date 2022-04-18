const socket = io('localhost:5000')
const PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection

const peerConnection = new PeerConnection()
let getCalled = false
let isAlreadyCalling = false

async function callUser(socketId) {
  peerConnection.createOffer().then(offer => {
    peerConnection.setLocalDescription(offer)
    socket.emit('call-user', {
      offer,
      to: socketId
    })
  })
}

function updateUserList(socketList) {
  const activeUserList = document.getElementById('user-list')

  socketList.forEach(socketId => {
    const alreadyExist = document.getElementById(socketId)
    if (!alreadyExist) {
      const userEl = document.createElement('li')
      userEl.setAttribute('id', socketId)
      userEl.textContent = socketId
      userEl.addEventListener('click', () => {
        document.getElementById('talking-with-info').textContent = `talking with ${socketId}`
        callUser(socketId)
      })
      activeUserList.append(userEl)
    }
  })
}

socket.on("remove-user", ({socketId}) => {
  const elToRemove = document.getElementById(socketId);

  if (elToRemove) {
    elToRemove.remove();
  }
})

socket.on('update-user-list', (res) => {
  const {user: userList} = res
  console.log(userList)
  updateUserList(userList)
})

socket.on('call-made', async ({offer, from}) => {
  if (getCalled) {
    const confirmed = confirm(`User ${from} want to call you. Do accept this call?`)
    if (!confirmed) {
      socket.emit('reject-call', {
        to: from
      })
      return
    }
  }
  await peerConnection.setRemoteDescription(offer)
  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  socket.emit("make-answer", {
    answer,
    to: from
  });
  getCalled = true;
})

socket.on('answer-made', async ({answer, from}) => {
  await peerConnection.setRemoteDescription(answer)

  if (!isAlreadyCalling) {
    callUser(from).then(() =>
      isAlreadyCalling = true
    )
  }
})

const {
  videoInputs: cameras,
  audioInputs: microphones
} = VueUse.useDevicesList({
  requestPermissions: true
})

const currentCamera = Vue.computed(() => cameras.value[0]?.deviceId)
const currentMicrophone = Vue.computed(() => microphones.value[0]?.deviceId)

const {stream, start} = VueUse.useUserMedia({
  videoDeviceId: currentCamera,
  audioDeviceId: currentMicrophone
})
start()
const localVideo = document.getElementById('local-video')
Vue.watch(stream ,() => {
  if (localVideo) localVideo.srcObject = stream.value
  stream.value.getTracks().forEach(track => peerConnection.addTrack(track, stream.value))
})

peerConnection.addEventListener('track', ({streams: [stream]}) => {
  const remoteVideo = document.getElementById('remote-video')
  if (remoteVideo) remoteVideo.srcObject = stream
})

// const devices = navigator.mediaDevices
// devices.getUserMedia({video: true, audio: true})
//   .then((stream) => {
//     const localVideo = document.getElementById('local-video')
//     if (localVideo) localVideo.srcObject = stream
//   })
//   .catch(err => {
//     console.error(err.message)
//   })
