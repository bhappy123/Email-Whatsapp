import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Message.css'
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import RoomIcon from '@material-ui/icons/Room';
const Message = ({ message, userImage, user, timestamp, avatar, index }) => {
    const [isImage, setIsImage] = useState(false)
    const [isVideo, setIsVideo] = useState(false)
    const [isLink, setIsLink] = useState(false)
    const [isDocument, setIsDocument] = useState(false)
    const getExtension = (fileURL) => {
        var parts = fileURL.split('.');
        const endPart = parts[parts.length - 1];
        // console.log(endPart);
        return endPart.split('?', 1)
    }
    useEffect(() => {
        if (avatar) {
            const fileType = getExtension(avatar);
            console.log(fileType[0]);
            if (fileType[0] === "jpg" || fileType[0] === "png" || fileType[0] === "gif") {
                setIsImage(true)
                console.log("matched");
            }
            else if (fileType[0] === "mp4" || fileType[0] === "avi" || fileType[0] === "mkv") {
                setIsVideo(true);
            }
            else if (fileType[0] === "pdf" || fileType[0] === "doc" || fileType[0] === "ppt") {
                setIsDocument(true);
                console.log("it's a pdf")
            }
        }
        if (message) {
            if (message.includes('https://goo.gl/maps/')) {
                setIsLink(true);
            }
        }
    }, [])



    return (
        <div className="message" key={index}>
            <img src={userImage} alt="" />
            <div className="message__info">
                <h4>{user} <span className="message_timestamp">{new Date(timestamp?.toDate()).toUTCString()}</span></h4>
                {!isLink ? <p>{message}</p> : <div><div><RoomIcon color="secondary" style={{ fontSize: 80 }} /></div> <a href={message} target="_blank">View On Map</a></div>}

                {isImage && <img className="message__userFile" src={avatar} alt="" />}
                {isVideo && <video controls><source src={avatar} type="video/mp4" /></video>}
                {isDocument &&
                    <p><div><PictureAsPdfIcon color="primary" style={{ fontSize: 80 }} /></div><a href={avatar} target="_blank">Download  PDF.</a></p>
                }
            </div>
        </div>
    )
}

export default Message