import React, { useEffect, useState } from 'react'
import './header.css'
import { Avatar } from '@material-ui/core';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew'
import SearchIcon from '@material-ui/icons/Search'
import AddIcon from '@material-ui/icons/Add'
import { useStateValue } from './StateProvider';
import db, { auth } from './firebase';
import { Link } from 'react-router-dom'
import AddFriend from './AddFriend';
const Header = () => {
    const [{ user }] = useStateValue();
    const [allChannels, setAllChannels] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [modalState, setModalState] = useState(false);
    const getChannels = (e) => {
        setSearchResult([]);
        allChannels.filter(channel => {
            if (e.target.value) {
                let res = channel['name'].includes(e.target.value);
                console.log(res);
                if (res) {
                    setSearchResult(prevSearch => [...prevSearch, { 'id': channel['id'], 'name': channel['name'] }])
                }
            }

        })
    }
    useEffect(() => {
        db.collection('rooms').onSnapshot(snapshot => (
            snapshot.docs.map(doc => {
                setAllChannels(prevChannel => [...prevChannel, { 'name': doc.data().name, 'id': doc.id }])
                // console.log();
            }
            )))

    }, [])
    const logoutController = () => {
        auth.signOut();
    }

    const toggleModal = () => {
        if (modalState) {
            setModalState(false);
        }
        else {
            setModalState(true);
        }
    }
    return (
        <div className="header">
            <div className="header__left">
                <Avatar
                    className="header__avatar"
                    alt={auth.currentUser.displayName}
                    src={auth.currentUser.photoURL}
                />
                <PowerSettingsNewIcon onClick={logoutController} />
            </div>
            <div className="header__search">
                <SearchIcon />
                <input type="text" placeholder="Search for groups...." onChange={getChannels} />
                {searchResult.length !== 0 && <div className="header__searchresult">
                    {searchResult.map(channel => (
                        <Link to={`/room/${channel['id']}`}><h4>{channel['name']}</h4></Link>
                    ))}
                </div>}
            </div>
            <div className="header__right">
                <AddIcon onClick={toggleModal} />
                {modalState && <div className="modal">
                    <AddFriend />
                </div>}
            </div>
        </div>
    )
}

export default Header
