import React, { useState } from 'react'
import './chatinput.css'
import AttachmentIcon from '@material-ui/icons/Attachment';
import db, { auth } from './firebase'
import firebase from 'firebase'
import { firebaseApp } from "./firebase";
import VideoChat from './VideoChat';
const ChatInput = ({ channelName, channelId, isGroup, uId, friendEmail }) => {

    const [fileUrl, setFileUrl] = useState(null);
    const [input, setInput] = useState('')

    const user = auth.currentUser;
    const sendMessage = (e) => {
        e.preventDefault();
        console.log(input, user.displayName, firebase.firestore.FieldValue.serverTimestamp(), user.photoURL);
        if (channelId && isGroup) {
            console.log(channelId);
            db.collection('rooms').doc(channelId).collection('messages').doc().set({
                message: input,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                user: user.displayName,
                userImage: user.photoURL,
                avatar: fileUrl,
            })
        }
        else {
            let friendId = null;
            let commonFriendId = null;

            // friend Id
            db.collection('users').where('email', '==', friendEmail).get().then((snapshot) => {
                friendId = snapshot.docs[0].id;
                console.log("friend Id", friendId);
                console.log(auth.currentUser.email);
                if (friendId) {
                    // Inside friend -> The Messenger or Current user Common Friend Id
                    db.collection('users').doc(friendId).collection('friends').where('email', '==', auth.currentUser.email).get().then((snapshot) => {
                        commonFriendId = snapshot.docs[0].id;
                        console.log("common Id", commonFriendId);
                        if (commonFriendId) {
                            db.collection('users').doc(friendId).collection('friends').doc(commonFriendId).collection('messages').doc().set({
                                message: input,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                user: user.displayName,
                                userImage: user.photoURL,
                                avatar: fileUrl,
                            })
                        }
                    })
                }
            })
            console.log("mail:", friendEmail);
            // Adding Message to user collection
            db.collection('users').doc(uId).collection('friends').doc(channelId).collection('messages').doc().set({
                message: input,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                user: user.displayName,
                userImage: user.photoURL,
                avatar: fileUrl,
            })

            // Adding message to friend's Id

        }
    }

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        const storageRef = firebaseApp.storage().ref();
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        setFileUrl(await fileRef.getDownloadURL());
    };
    return (
        <div className='chatinput'>
            <VideoChat friendEmail={friendEmail} />
            <form>
                <input type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="type here..."
                    className="chatmessagebox"
                />
                <div className="fileInput"><AttachmentIcon /><input className="chatinput__file" type="file" onChange={onFileChange} /></div>
                <button type="submit" onClick={sendMessage}>Submit</button>
            </form>
        </div>
    )
}

export default ChatInput
