import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import {ajax} from "rxjs/ajax";
import {tap} from 'rxjs/operators';
import _ from 'lodash';
import fileManager from "./fileManager";

const post = (location, body, timeout = 10000) => {
    return ajax({
        url: 'https://digital-circuitboard.ru/' + location,
        method: 'POST',
        timeout,
        body,
    });
};

class driveManager {
    static sessionId = null;
    static isLoggedIn = false;
    static user = null;

    static checkSession() {
        let sessionId = Cookies.get('session_id');

        if(!sessionId) {
            sessionId = uuidv4();
            Cookies.set('session_id', sessionId, {path: '/', expires: 7});
        }

        this.sessionId = sessionId;

        return this.authorize();
    }

    static sendCode(code) {
        return post('code', {
            code,
            sessionId: this.sessionId
        }).pipe(
            tap((data) => {
                this.isLoggedIn = _.get(data, 'response.status', false) === 'success';
                this.user = _.get(data, 'response.user', null);
            })
        );
    }

    static listFiles(folderId) {
        const sessionId = this.sessionId;

        return post('files', {
            sessionId,
            folderId
        }).pipe(
            tap((data) => {
                this.isLoggedIn = !(_.get(data, 'response.status', false) === 'auth');
                this.user = this.isLoggedIn ? this.user : null;
            })
        );
    }

    static getFile(fileId) {
        const sessionId = this.sessionId;

        return post('load', {
            sessionId,
            fileId
        }, 20000).pipe(
            tap((data) => {
                this.isLoggedIn = !(_.get(data, 'response.status', false) === 'auth');
                this.user = this.isLoggedIn ? this.user : null;
            })
        );
    }

    static saveFile(data, folderId) {
        const sessionId = this.sessionId;
        const schemeData = fileManager.makeFile(data);

        return post('save', {
            sessionId,
            schemeData,
            folderId
        }, 20000).pipe(
            tap((data) => {
                this.isLoggedIn = !(_.get(data, 'response.status', false) === 'auth');
                this.user = this.isLoggedIn ? this.user : null;
            })
        );
    }

    static logout() {
        const sessionId = this.sessionId;

        return post('logout', {sessionId})
            .pipe(
                tap((data) => {
                    this.isLoggedIn = !(_.get(data, 'response.status', false) === 'success');
                    this.user = this.isLoggedIn ? this.user : null;
                })
            );
    }

    static authorize() {
        const sessionId = this.sessionId;

        return post('auth', {sessionId})
            .pipe(
                tap((data) => {
                    this.isLoggedIn = _.get(data, 'response.status', false) === 'success';
                    this.user = _.get(data, 'response.user', null);
                })
            );
    }
}

export default driveManager;
