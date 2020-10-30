import React from 'react'
import { useHistory } from 'react-router-dom'
import db from './firebase';
import './sidebaroption.css'
const SidebarOption = ({ Icon, title, addChannelOption, id }) => {
    const history = useHistory();
    const selectChannel = () => {
        if (id) {
            history.push(`/room/${id}`)
        }
        else {
            history.push(title);
        }
    }
    const addChannel = () => {
        const channelName = prompt('enter a channel name');
        if (channelName) {
            db.collection('rooms').add({
        name: channelName
    })
}

    }
    return (
        <div className="sidebaroption" onClick={addChannelOption ? addChannel : selectChannel}>
            { Icon && <Icon className="sidebaroption__icon" />}
            {Icon ?
                <h3 className="sidebaroption__channel">{title}</h3> :
                <h3> <span className="sidebaroption__hash">#</span>{title}</h3>}
        </div>
    )
}

export default SidebarOption
