import React, { useState } from 'react'
import './addfriend.css'
import db, { auth } from './firebase'

const AddFriend = () => {
    const [input, setInput] = useState("")
    const submitHandler = (e) => {
        e.preventDefault();
        console.log("clicked")
        console.log(auth.currentUser.email)
        db.collection('users').where('email', '==', auth.currentUser.email).get().then((snapshot) => {
            const currentUid = snapshot.docs[0].id;
            let friendId = null;
            db.collection('users').where('email', '==', input).get().then((snapshot) => {
                friendId = snapshot.docs[0].id;
            })
            console.log(currentUid)
            if (currentUid) {
                db.collection('users').doc(currentUid).collection('friends').where('email', '==', input).get().then(snapshot => {
                    if (snapshot.docs[0]) {
                        console.log("You Are Already Friends");
                    }
                    else {
                        db.collection('users').doc(currentUid).collection('friends').doc().set({
                            email: input
                        })
                        db.collection('users').doc(friendId).collection('friends').doc().set({
                            email: auth.currentUser.email
                        })
                        console.log("User Added Successfully")
                    }

                })
            }
        })

        // Current User
        // await db.collection('users').doc(auth.currentUser.uid).collection('friends').get().then(snapshot => {
        //     console.log(snapshot)
        //     snapshot.forEach((doc) => {
        //         console.log(doc.data().email)

        //     })
        // });

        // Add New friend
        // await db.collection('users').get().then(snapshot => {
        //     snapshot.forEach((doc) => {
        //         console.log(doc.data().email)
        //         if (doc.data().email === input) {
        //             db.collection('users').doc(doc.id).collection('friends').doc().set({
        //                 email: doc.data().email,
        //             })
        //         }
        //     })
        // })         bikashranjandash0@gmail.com
    }
    return (
        <div className="addfriend" >
            <form onSubmit={submitHandler}>
                <input className="addfriend__friend" type="text" onChange={(e) => setInput(e.target.value)} />
                <button type="submit" className="addfriend__button">Add User</button>
            </form>
        </div>
    )
}
export default AddFriend