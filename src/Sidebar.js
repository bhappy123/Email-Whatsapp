import React, { useEffect, useState } from 'react'
import './sidebar.css'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create';
import InsertComment from '@material-ui/icons/InsertComment'
import SidebarOption from './SidebarOption';
import db, { auth } from './firebase';
import { useStateValue } from './StateProvider';

const Sidebar = () => {
    const [friends, setFriends] = useState([]);
    const [channels, setChannels] = useState([]);
    const [{ user }] = useStateValue();
    useEffect(() => {
        db.collection('rooms').onSnapshot(snapshot => (
            setChannels(snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            })))
        ))
    }, [])

    useEffect(() => {
        db.collection('users').where('email', '==', auth.currentUser.email).get().then((snapshot) => {
            const currentUid = snapshot.docs[0].id;
            console.log(currentUid)
            if (currentUid) {
                db.collection('users').doc(currentUid).collection('friends').onSnapshot(snapshot => (
                    setFriends(snapshot.docs.map(doc => ({
                        id: doc.id,
                        email: doc.data().email,
                    }))
                    )))
            }
        })
    }, [])
    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__info">
                    <h2>Bikash</h2>
                    <h3><FiberManualRecordIcon />{auth.currentUser.displayName}</h3>
                </div>
                <CreateIcon />
            </div>
            <SidebarOption Icon={InsertComment} title="React Devs" />
            <SidebarOption title="Personal" />
            <SidebarOption Icon={AddIcon} title="Add Channel" addChannelOption />
            {channels.map(channel => (
                <SidebarOption title={channel.name} id={channel.id} />
            ))}
            {friends.map(friend => (
                <SidebarOption title={friend.email} id={friend.id} />
            ))}
        </div>
    )
}

export default Sidebar
