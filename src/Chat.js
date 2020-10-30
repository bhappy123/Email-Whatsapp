import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import StartBorderOutlinedIcon from '@material-ui/icons/StarBorderOutlined'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import './chat.css';
import db, { auth } from './firebase';
import Message from './Message';
import ChatInput from './ChatInput';
const Chat = () => {
    const { roomId } = useParams();
    const [friendListId, setFriendListId] = useState([]);
    const [roomMessages, setRoomMessages] = useState([]);
    const [roomDetails, setRoomDetails] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    useEffect(() => {
        if (roomId) {
            db.collection('users').where('email', '==', auth.currentUser.email).get().then(snapshot => {
                setCurrentUserId(snapshot.docs[0].id);
                if (currentUserId) {
                    db.collection('users').doc(currentUserId).collection('friends').onSnapshot(snapshot => {
                        setFriendListId(snapshot.docs.map(doc => doc.id))
                    })
                }
                // console.log(currentUserId);
            })
            if (!friendListId.includes(roomId)) {
                setRoomMessages([]);
                setRoomDetails([]);
                db.collection('rooms').doc(roomId).onSnapshot(snapshot => setRoomDetails(snapshot.data()));
                db.collection('rooms')
                    .doc(roomId)
                    .collection('messages')
                    .orderBy('timestamp', 'asc')
                    .onSnapshot((snapshot) => setRoomMessages(snapshot.docs.map(doc => doc.data())
                    ))
            }
            else if (friendListId.includes(roomId)) {
                setRoomMessages([]);
                setRoomDetails([]);
                db.collection('users')
                    .doc(currentUserId)
                    .collection('friends')
                    .doc(roomId)
                    .collection('messages')
                    .orderBy('timestamp', 'asc')
                    .onSnapshot((snapshot) => setRoomMessages(snapshot.docs.map(doc => doc.data())))

                db.collection('users').doc(currentUserId).collection('friends').doc(roomId).onSnapshot(snapshot => setRoomDetails(snapshot.data()));
            }
        }
    }, [roomId])
    // console.log(roomMessages);
    return (
        <div className="chat">
            <div className="chat__header">
                <div className="chat__headerLeft">
                    <div className="chat__channelName">
                        <strong># {!friendListId.includes(roomId) ? roomDetails?.name : roomDetails?.email} <StartBorderOutlinedIcon /></strong>
                    </div>
                </div>
                <div className="chat__headerRight">
                    <p><InfoOutlinedIcon /> Details</p>
                </div>

            </div>
            <div className="chat__messages">
                {roomMessages.map(({ message, timestamp, user, userImage, avatar }, index) => (
                    <Message
                        message={message}
                        timestamp={timestamp}
                        user={user}
                        userImage={userImage}
                        avatar={avatar}
                        id={index}
                    />
                ))}
            </div>
            <ChatInput channelName={roomDetails?.name} channelId={roomId} isGroup={!friendListId.includes(roomId) ? true : false} uId={currentUserId} friendEmail={roomDetails?.email} />
        </div>
    )
}

export default Chat
