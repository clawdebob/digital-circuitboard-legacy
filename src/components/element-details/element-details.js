import React from "react";
import {fromEvent} from "rxjs";
import DETAILS from './details.consts';
import _ from 'lodash';

class ElementDetails extends React.Component{
    constructor(props) {
        super(props);
        this.className = 'element-details';
        this.currentProp = null;
        this.handleFocus = this.handleFocus.bind(this);
        this.resetElementState = this.resetElementState.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.blurSubscription = null;
    }

    resetElementState() {
        const curEl = this.props.currentEl;
        const [input] = document.getElementsByName(this.currentProp);

        if(isNaN(input.value)) {
            curEl.props[this.currentProp] = input.value;
        } else {
            curEl.props[this.currentProp] = Number(input.value);
        }

        curEl.setProps(curEl.props);

        this.props.handleChange(curEl);
        if(this.blurSubscription) {
            this.blurSubscription.unsubscribe();
        }
    }

    handleFocus(e, prop) {
        const input = e.target;
        this.currentProp = prop;

        this.blurSubscription = fromEvent(input, 'blur')
            .subscribe(this.resetElementState);
    }

    handleChange(e, prop) {
        this.currentProp = prop;
        this.resetElementState();
    }

    generateOptions(type, prop) {
        let optionsList;
        const element = this.props.currentEl;

        switch(type) {
            case 'signal':
                optionsList = _.map([0, 1], (val) => {
                   return (
                       <option value={val}>{val}</option>
                   );
                });
                break;
            case 'range':
                let optionArray = [];

                if(prop === 'inContacts' || prop === 'outContacts') {
                    for(let c = 2; c <= element.maxContacts; c++) {
                        optionArray.push(c);
                    }
                    optionsList = _.map(optionArray, (val) => {
                        return (
                            <option value={val}>{val}</option>
                        );
                    });
                }
                break;
            default:
                optionsList = (<option>Not specified</option>);
                break;
        }

        return optionsList;
    }

    getElementData() {
        const element = this.props.currentEl;

        return Object.keys(element.props).map((prop) => {
            const key = `${element.name}_${prop}`;
            const type = _.get(DETAILS[prop], 'inputType', null);
            const name = _.get(DETAILS[prop], 'name', null);
            const valueType = _.get(DETAILS[prop], 'valueType', null);

            return (
                <tr key={key}>
                    <td key={prop}>
                        <span className={'prop-name'}>{name || prop}</span>
                    </td>
                    <td
                        key={key}
                    >
                        <span>
                            {type !== 'select' ? (
                                <input
                                    type={type || 'text'}
                                    defaultValue={element.props[prop]}
                                    onFocus={type ? null : (e) => this.handleFocus(e, prop)}
                                    onChange={type ? (e) => this.handleChange(e, prop) : null}
                                    name={prop}
                                    className={'prop-input'}
                                    key={key}
                                />
                            ) : (
                                <select
                                    defaultValue={element.props[prop]}
                                    onChange={(e) => this.handleChange(e, prop)}
                                    name={prop}
                                    className={'prop-input'}
                                    key={key}
                                >
                                    {this.generateOptions(valueType, prop)}
                                </select>
                            ) }
                        </span>
                    </td>
                </tr>
            );
        });
    }

    render() {
        if (this.props.currentEl) {
            const elementData = this.getElementData();

            return (
                <div className={`${this.className}__wrapper`}>
                    <table className={this.className}>
                        <caption className={`${this.className}__title`}>
                            {`${this.props.currentEl.name} Properties`}
                        </caption>
                        <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                        {elementData}
                        </tbody>
                    </table>
                </div>
            );
        }

        return null;
    }
}

export default ElementDetails;
