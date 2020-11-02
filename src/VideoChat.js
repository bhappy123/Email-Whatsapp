import React, { useEffect, useState } from 'react'
import db, { auth } from './firebase';
import './VideoChat.css'
const VideoChat = ({ friendEmail }) => {

    const [localStream, setLocalStream] = useState()
    // const [remoteStream, setRemoteStream] = useState();
    const [callee, setCallee] = useState("");
    const [roomId, setRoomId] = useState(null);
    const [callerJoined, setCallerJoined] = useState(false);
    const [offer, setOffer] = useState(false);
    const [answer, setAnswer] = useState(false)
    const [calleeIceCandidate, setCalleeIceCandidate] = useState(false);
    const [calleeIceCandidateValue, setCalleeIceCandidateValue] = useState({});
    const [callerIceCandidate, setCallerIceCandidate] = useState(false);
    const [callerIceCandidateValue, setCallerIceCandidateValue] = useState({});
    const [offerSDP, setOfferSDP] = useState("");
    const [answerSDP, setAnswerSDP] = useState("");
    const [rtcPeerConnection, setRtcPeerConnection] = useState();

    // ICE SErvers
    const iceServer = {
        'iceServer': [
            { "urls": "stun:stun.services.mozilla.com" },
            { "urls": "stun:stun2.1.google.com:19302" }
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
            CalleeIceCandidate: {
                type: "",
                label: "",
                id: "",
                candidate: "",
            },
            callericecandidate: {
                type: "",
                label: "",
                id: "",
                candidate: "",
            },
            isJoined: false,
        })
        await db.collection('videochatrooms').where('callee', '==', auth.currentUser.email).get().then(snapshot => {

            setRoomId(snapshot.docs[0].id)
        })

        // set Local Camera
        setCallee(true)
        navigator.mediaDevices.getUserMedia(streamConstrains)
            .then(stream => {
                setLocalStream(stream)
                document.querySelector('#localVideo').srcObject = stream
            }).catch(err => console.log("error:", err))
    }

    // To Join a Room

    const joinRoom = () => {
        setCallee(false)
        if (!callee) {
            db.collection('videochatrooms').where('caller', '==', auth.currentUser.email).get().then(snapshot => {
                setRoomId(snapshot.docs[0].id)
            })
            // set Local Camera
            navigator.mediaDevices.getUserMedia(streamConstrains)
                .then(stream => {
                    setLocalStream(stream)
                    // ! console.log("caler local stream: ", stream.getTracks())
                    document.querySelector('#localVideo').srcObject = stream
                }).catch(err => console.log("error:", err))
        }
    }

    //  TODO: On Join or On Offer || on Answer    ------ SET THE RESPECTIVE STATE TO TRUE //

    if (roomId) {
        db.collection('videochatrooms').doc(roomId).onSnapshot((snapshot) => {
            if (callee === true && snapshot.data().isJoined) {
                if (!callerJoined) {
                    setCallerJoined(true);
                }
            }
            if (callee === false && !offer && snapshot.data().offer.type === "offer") {
                setOfferSDP(snapshot.data().offer)
                setOffer(true)
                // ! console.log("offer: ", snapshot.data().offer);
                // If Offer Arived Then Say The Caller To Give Answer
            }
            if (callee === true && !answer && snapshot.data().answer.type === "answer") {
                setAnswerSDP(snapshot.data().answer)
                setAnswer(true)
                // ! console.log("answer: ", snapshot.data().answer);
            }
            if (callee === true & !calleeIceCandidate && snapshot.data().CalleeIceCandidate.type === "candidate" && rtcPeerConnection) {
                setCalleeIceCandidateValue(snapshot.data().CalleeIceCandidate);
                setCalleeIceCandidate(true);
                // ! console.log(rtcPeerConnection)
                // console.log("callee candidate value: ", calleeIceCandidateValue);
            }
            if (callee === false && !callerIceCandidate && snapshot.data().callericecandidate.type === "candidate") {
                // ! console.log("caller candidate value: ", snapshot.data());
                setCallerIceCandidateValue(snapshot.data().callericecandidate);
                setCallerIceCandidate(true);
            }
        })
    }

    useEffect(() => {
        const pconnection = new RTCPeerConnection(iceServer);
        setRtcPeerConnection(pconnection);
        // ! console.log(pconnection)
    }, [])


    // * Set is Joined to true when caller Joined the room
    useEffect(() => {
        if (roomId) {
            if (callee === false) {
                (db.collection('videochatrooms').doc(roomId).update({
                    isJoined: true
                }))
                // ! console.log("User Joined for callee", callee)
            }
        }
    }, [roomId])

    // * Create a Offer If Caller Joined The room
    useEffect(() => {
        if (callerJoined) {
            // ! console.log("User Joined", snapshot.data().isJoined)

            // ! console.log("RTC PEER CONNECTION VALUE IS", rtcPeerConnection)
            if (rtcPeerConnection) {
                rtcPeerConnection.onicecandidate = onIceCandidate
                rtcPeerConnection.ontrack = onAddTrack
                rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
                rtcPeerConnection.createOffer()
                    .then(sessionDescription => {
                        rtcPeerConnection.setLocalDescription(sessionDescription)
                            // ! console.log("Offer desc: ", sessionDescription)
                            (db.collection('videochatrooms').doc(roomId).update({
                                offer: {
                                    type: "offer",
                                    sdp: sessionDescription.sdp,
                                }
                            }))
                    }).catch(err => {
                        console.log("offer error: ", err)
                    })
            }
        }
    }, [callerJoined])


    // * If Callee Sends AN OFFER Then Caller Must Give an Answer
    useEffect(() => {
        if (offer) {
            // console.log("User Joined", snapshot.data().isJoined)
            rtcPeerConnection.onicecandidate = onIceCandidate
            rtcPeerConnection.ontrack = onAddTrack
            rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
            rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(offerSDP))
            rtcPeerConnection.createAnswer()
                .then(sessionDescription => {
                    console.log("Offer Session Description: ", sessionDescription)
                    rtcPeerConnection.setLocalDescription(sessionDescription)
                        (db.collection('videochatrooms').doc(roomId).update({
                            answer: {
                                type: "answer",
                                sdp: sessionDescription.sdp,
                            }
                        }))
                }).catch(err => {
                    console.log("Answer error: ", err)
                })
        }
    }, [offer])



    // * If Caller sends an ANSWER THEN Callee MUST The Remote description (The Video element of Opposite User)
    useEffect(() => {
        if (answer) {
            rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answerSDP));
        }
    }, [answer])



    // * On Addition Of Stream Set Remote Video Object
    const onAddTrack = (event) => {
        console.log("Remote Stream Value: ", event.streams[0]);
        document.querySelector('#remoteVideo').srcObject = event.streams[0]
        // ! remoteStream.srcObject = event.streams[0]
    }


    // On Getting An Ice Candidate 
    useEffect(() => {
        if (calleeIceCandidateValue.type === "candidate") {
            // ! console.log("calleerIce Candidate rtcPeerConnection Value", rtcPeerConnection)
            const iceCandidate = new RTCIceCandidate({
                sdpMLineIndex: calleeIceCandidateValue.label,
                candidate: calleeIceCandidateValue.candidate,
            })
            // ! console.log("calleeIceCandidate", iceCandidate)
            rtcPeerConnection.addIceCandidate(iceCandidate);
        }
    }, [calleeIceCandidate])

    useEffect(() => {
        if (callerIceCandidateValue.type === "candidate") {
            const iceCandidate = new RTCIceCandidate({
                sdpMLineIndex: callerIceCandidateValue.label,
                candidate: callerIceCandidateValue.candidate,
            })
            rtcPeerConnection.addIceCandidate(iceCandidate);
        }

    }, [callerIceCandidate])


    // * On Ice Candidate Function
    const onIceCandidate = (event) => {
        if (event.candidate) {
            // ! console.log("Sending Ice Candidate", event.candidate)
            if (callee === true) {
                (db.collection('videochatrooms').doc(roomId).update({
                    CalleeIceCandidate: {
                        type: "candidate",
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate,
                    }
                }))
            }
            else if (callee === false) {
                (db.collection('videochatrooms').doc(roomId).update({
                    callericecandidate: {
                        type: "candidate",
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate,
                    }
                }))
            }
        }
    }



    return (
        <div className="videochat">
            <video id="localVideo" autoPlay playsInline></video>
            <video id="remoteVideo" autoPlay playsInline></video>
            <button onClick={createRoom}>Initiate Call</button>
            <button onClick={joinRoom}>Answer</button>
        </div>
    )
}

export default VideoChat
