import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import db, { auth } from './firebase'
import './VideoChat.css'

const VideoChat = ({ friendEmail }) => {

    const [callStarted, setCallStarted] = useState(false)
    const [callRequest, setCallRequest] = useState(false);
    const peerConnection = new RTCPeerConnection();
    let remoteStream
    // webRTC Constraints
    var constraints = {
        video: true
    };
    function handleSuccess(stream) {
        peerConnection.addStream(stream);
        peerConnection.createOffer();
        document.querySelector('#videochat__personVideo').srcObject = stream;
        remoteStream = new MediaStream();
        document.querySelector('#videochat__friendVideo').srcObject = remoteStream;

    }

    function handleError(error) {
        console.log('getUserMedia error: ', error);
    }

    const InitiateCall = () => {
        setCallStarted(true);
        navigator.mediaDevices.getUserMedia(constraints)
            .then(handleSuccess).catch(handleError)
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => console.log(peerConnection.localDescription.type, "fmail:", friendEmail, "user", auth.currentUser.email))
            .then(() => {
                db.collection('videorooms').doc().set({
                    callee: auth.currentUser.email,
                    caller: friendEmail,
                    offer: {
                        type: peerConnection.localDescription.type,
                        sdp: peerConnection.localDescription.sdp,
                    },
                    answer: {
                        type: "",
                        sdp: "",
                    },
                })
            })

    }

    // Change when User accept the call
    db.collection('videorooms').where('callee', '==', auth.currentUser.email).onSnapshot(async (snapshot) => {
        if (snapshot.docs[0]) {
            if (snapshot.docs[0].data().answer.type === "answer") {
                console.log(snapshot.docs[0].data().answer.type)
                
            }
        }
    })

    // Accept Call
    db.collection('videorooms').where('caller', '==', auth.currentUser.email).onSnapshot((snapshot) => {
        if (snapshot.docs[0]) {
            setCallRequest(true);
        }
    })

    // Create Answer
    const acceptCall = () => {
        db.collection('videorooms').where('caller', '==', auth.currentUser.email).get().then((snapshot) => {
            const offerData = snapshot.docs[0].data().offer;
            let roomId = null;
            if (offerData) {
                setCallStarted(true);
                navigator.mediaDevices.getUserMedia(constraints)
                    .then((stream) => {
                        document.querySelector('#videochat__personVideo').srcObject = stream;
                        peerConnection.setRemoteDescription(offerData)
                    })
                    .then(() => peerConnection.createAnswer())
                    .then(sdp => peerConnection.setLocalDescription(sdp))
                    .then(console.log(peerConnection.localDescription))
                    .then(() => {
                        db.collection('videorooms').where('caller', '==', auth.currentUser.email).get().then(snap => {
                            roomId = snap.docs[0].id
                            setAnswer(roomId)

                        })
                    })


            }

            // Set ANswer Data to database
            const setAnswer = (roomId) => {
                db.collection('videorooms').doc(roomId).update({
                    answer: {
                        type: peerConnection.localDescription.type,
                        sdp: peerConnection.localDescription.sdp,
                    },
                })
            }
        })
        console.log("hello");
    }



    const closeCall = () => {
        setCallStarted(false);
        const tracks = document.querySelector('#videochat__personVideo').srcObject.getTracks();
        tracks.forEach(track => {
            track.stop();
        });
    }



    return (
        <div className={callStarted ? 'videochat videochat__started' : 'videochat'}>
            <div className="videochat__screen">
                {callStarted && <video id="videochat__personVideo" autoPlay playsInline></video>}
                {callStarted && <video id="videochat__friendVideo" autoPlay playsInline></video>}
            </div>
            {!callRequest && <Button color="primary" onClick={InitiateCall} className="videochat__startbtn">Video Call</Button>}
            {callRequest && <Button color="primary" onClick={acceptCall} className="videochat__startbtn">Accept Call</Button>}
            {callStarted && <Button color="secondary" className="videochat__closebtn" variant="contained" onClick={closeCall}>X </Button>}
        </div>
    )
}

export default VideoChat
