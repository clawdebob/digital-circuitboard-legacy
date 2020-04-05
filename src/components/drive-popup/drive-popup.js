import React from 'react';
import Button from '../button/button';
import driveManager from "../../services/driveManager";

class DrivePopup extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            needAuth: false,
        }
    }

    sendCode() {
        const form = document.forms.auth;
        const code = form.elements.code.value;

        driveManager
            .sendCode(code)
            .subscribe((data) => {
                const status = data.response.status;

                if(status === 'success') {
                    this.props.showNotice({
                        description: 'Successfully Logged in Google Account',
                        type: 'success'
                    });
                    this.setState({
                        needAuth: false
                    });
                } else {
                    this.props.showNotice({
                        title: 'Error',
                        description: 'Invalid Code',
                        type: 'error'
                    });
                }
                this.props.close();
            },() => {
                this.props.showNotice({
                    title: 'Error',
                    description: 'Google Drive Service Unavailable',
                    type: 'error'
                });
                this.props.close();
            });
    }
    closePopup() {
        this.setState({
            needAuth: false,
        });
        this.props.close();
    }

    authToGdrive() {
        driveManager
            .authorize()
            .subscribe((data) => {
                const {response} = data;
                const {status} = response;

                if(status === 'success') {
                    this.props.showNotice({
                        description: 'Successfully Logged in Google Account',
                        type: 'success'
                    });
                    this.props.close();
                } else if (status === 'needAuth') {
                    window.open(response.link, '_blank');
                    this.setState({needAuth: true})
                } else {
                    this.props.showNotice({
                        title: 'Error',
                        description: 'Auth failed',
                        type: 'error'
                    });
                }
            }, () => {
                this.props.showNotice({
                    title: 'Error',
                    description: 'Google Drive Service Unavailable',
                    type: 'error'
                });
                this.props.close();
            });
    }

    logoutFromGdrive() {
        driveManager
            .logout()
            .subscribe((data) => {
                const {response} = data;
                const {status} = response;

                if(status === 'success') {
                    this.props.showNotice({
                        description: 'Log out successful',
                        type: 'success'
                    });
                    this.props.close();
                } else {
                    this.props.showNotice({
                        title: 'Error',
                        description: 'Logout failed',
                        type: 'error'
                    });
                }
            }, () => {
                this.props.showNotice({
                    title: 'Error',
                    description: 'Google Drive Service Unavailable',
                    type: 'error'
                });
                this.props.close();
            });
    }

    render() {
        const {isVisible} = this.props;

        return isVisible ? (
            <div className="fade-curtain">
                <div className="drive-popup">
                    <span
                        className="close"
                        onClick={() => this.closePopup()}
                    >
                        ✕
                    </span>
                    {
                        this.state.needAuth ? (
                            <div className="drive-popup--auth">
                                <h3>Paste your code here:</h3>
                                <form name="auth">
                                    <textarea
                                        id="code"
                                        name="code"
                                    />
                                </form>
                                <div>
                                    <Button
                                        id="submit-button"
                                        type="primary"
                                        text="Submit"
                                        onClick={() => this.sendCode()}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="drive-popup--main">
                                <h3>Google Account Management</h3>
                                <div className="drive-popup--main--buttons">
                                    <Button
                                        id="authorize-button"
                                        text="Sign in"
                                        type="primary"
                                        disabled={driveManager.isLoggedIn}
                                        onClick={() => this.authToGdrive()}
                                    />
                                    <Button
                                        id="signout-button"
                                        disabled={!driveManager.isLoggedIn}
                                        onClick={() => this.logoutFromGdrive()}
                                        text="Sign out"
                                    />
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        ) : null;
    }
}

export default DrivePopup;
