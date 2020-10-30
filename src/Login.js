import React, { useEffect } from 'react'
import { Button } from '@material-ui/core'
import db, { auth, provider } from './firebase';
import './Login.css'
import { actionTypes } from './Reducer';
import { useStateValue } from './StateProvider';
const Login = () => {

    useEffect(() => {
        if (auth.currentUser) {
            dispatch({
                type: actionTypes.SET_USER,
                user: auth.currentUser.email,
            })
        }
    }, [])

    const [state, dispatch] = useStateValue();
    const signIn = () => {
        auth.signInWithPopup(provider)
            .then((result) => {
                console.log(result);
                dispatch({
                    type: actionTypes.SET_USER,
                    user: result.user,
                })
                if (result.additionalUserInfo.isNewUser) {
                    console.log(result.user.email);
                    db.collection('users').doc().set({
                        email: result.user.email
                    })
                }
            })
            .catch((error) => {
                alert(error.message)
            })
    }
    return (
        <div className="login">
            <div className="login__container">
                <img width="100px" src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png" alt="" />
                <Button onClick={signIn}>Log In with Google</Button>
            </div>
        </div>
    )
}

export default Login
