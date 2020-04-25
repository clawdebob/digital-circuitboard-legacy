import React from 'react';
import Button from '../button/button';
import driveManager from "../../services/driveManager";
import PubSub from "../../services/pubSub";
import {EVENT} from "../../consts/events.consts";
import i18next from 'i18next';

const t = (str) => i18next.t(str);

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
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        description: 'gdrive.success.login',
                        type: 'success'
                    });
                } else {
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        title: 'error',
                        description: 'gdrive.error.code',
                        type: 'error'
                    });
                }
                this.closePopup();
                this.setState({needAuth: false});
            },() => {
                PubSub.publish(EVENT.SHOW_NOTICE,{
                    title: 'error',
                    description: 'gdrive.error.unknown',
                    type: 'error'
                });
                this.closePopup();
                this.setState({needAuth: false});
            });
    }
    closePopup() {
        PubSub.publish(EVENT.TOGGLE_GDRIVE_POPUP, false);
    }

    authToGdrive() {
        driveManager
            .authorize()
            .subscribe((data) => {
                const {response} = data;
                const {status} = response;

                if(status === 'success') {
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        description: 'gdrive.success.login',
                        type: 'success'
                    });
                    this.closePopup();
                } else if (status === 'needAuth') {
                    window.open(response.link, '_blank');
                    this.setState({needAuth: true});
                } else {
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        title: 'error',
                        description: 'gdrive.error.login',
                        type: 'error'
                    });
                    this.closePopup();
                }
            }, () => {
                PubSub.publish(EVENT.SHOW_NOTICE,{
                    title: 'error',
                    description: 'gdrive.error.unknown',
                    type: 'error'
                });
                this.closePopup();
            });
    }

    logoutFromGdrive() {
        driveManager
            .logout()
            .subscribe((data) => {
                const {response} = data;
                const {status} = response;

                if(status === 'success') {
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        description: 'gdrive.success.logout',
                        type: 'success'
                    });
                } else {
                    PubSub.publish(EVENT.SHOW_NOTICE,{
                        title: 'error',
                        description: 'gdrive.error.logout',
                        type: 'error'
                    });
                }
                this.closePopup();
            }, () => {
                PubSub.publish(EVENT.SHOW_NOTICE,{
                    title: 'error',
                    description: 'gdrive.error.unknown',
                    type: 'error'
                });
                this.closePopup();
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
                                <h3>{t('gdrive.paste')}</h3>
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
                                        text={t('gdrive.submit')}
                                        onClick={() => this.sendCode()}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="drive-popup--main">
                                <h3>{t('gdrive.title')}</h3>
                                {driveManager.isLoggedIn ? (
                                    <div className="drive-popup--user">
                                        <img
                                            className="drive-popup--user--photo"
                                            src={driveManager.user.photo}
                                            alt=""
                                        />
                                        <p className="drive-popup--user--name">{driveManager.user.name}</p>
                                        <p className="drive-popup--user--email">{driveManager.user.email}</p>
                                    </div>
                                ) : null}
                                <div className="drive-popup--main--buttons">
                                    <Button
                                        id="authorize-button"
                                        text={t('gdrive.login')}
                                        type="primary"
                                        disabled={driveManager.isLoggedIn}
                                        onClick={() => this.authToGdrive()}
                                    />
                                    <Button
                                        id="signout-button"
                                        disabled={!driveManager.isLoggedIn}
                                        onClick={() => this.logoutFromGdrive()}
                                        text={t('gdrive.logout')}
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
