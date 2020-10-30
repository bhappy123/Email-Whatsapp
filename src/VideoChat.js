import React, { useEffect, useState } from 'react'
import db, { auth } from './firebase';
import './VideoChat.css'
const VideoChat = ({ friendEmail }) => {

    let localStream, remoteStream, rtcPeerConnection;
    const [callee, setCallee] = useState("");
    const [roomId, setRoomId] = useState(null);
    // ICE SErvers
    const iceServer = {
        'iceServer': [
            { urls: "stun:stun.services.mozilla.com" },
            { urls: "stun:stun.l.google.vo:.19302" }
        ]
    }

    // Stream Constrains Media accessable
    const streamConstrains = {
        'video': true,
    }

    // To Create new Room
    const createRoom = async () => {
        await db.collection('videochatrooms').doc().set({
            callee: auth.currentUser.email,
            caller: friendEmail,
            offer: {
                type: "",
                sdp: "",
            },
            answer: {
                type: "",
                sdp: ""
            },
            callericecandidate: "",
            CalleeIceCandidate: "",
            isJoined: false,
        })
        await db.collection('videochatrooms').where('callee', '==', auth.currentUser.email).get().then(snapshot => {

            setRoomId(snapshot.docs[0].id)
        })

        // set Local Camera
        setCallee(true)
        navigator.mediaDevices.getUserMedia(streamConstrains)
            .then(stream => {
                localStream = stream
                document.querySelector('#localVideo').srcObject = stream
            }).catch(err => console.log("error:", err))
    }

    // To Join a Room

    const joinRoom = () => {
        setCallee(false)
        if (!callee) {
            db.collection('videochatrooms').where('caller', '==', auth.currentUser.email).get().then(snapshot => {
                setRoomId(snapshot.docs[0].id)
                if (roomId) {
                    db.collection('videochatrooms').doc(roomId).update({
                        isJoined: true
                    })
                }
            })
            // set Local Camera
            navigator.mediaDevices.getUserMedia(streamConstrains)
                .then(stream => {
                    localStream = stream
                    document.querySelector('#localVideo').srcObject = stream
                }).catch(err => console.log("error:", err))
        }
    }

    // On Join
    if (roomId) {
        db.collection('videochatrooms').doc(roomId).onSnapshot((snapshot) => {
            console.log(snapshot)
            if (callee && snapshot) {
                console.log(snapshot.docs[0])
            }
        })
    }



    return (
        <div className="videochat">
            <video id="localVideo" autoPlay />
            <video id="remoteVideo" autoPlay />
            <button onClick={createRoom}>Initiate Call</button>
            <button onClick={joinRoom}>Answer</button>
        </div>
    )
}

export default VideoChat
