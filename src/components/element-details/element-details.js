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
        const prop = this.currentProp;
        const [input] = document.getElementsByName(this.currentProp);

        if((/invert\d+/).test(prop)) {
            curEl.setInPinInvertState(Number(prop.match(/\d+/)[0]) - 1,input.value === 'true')
        } else {
            if(input.value === 'true' || input.value === 'false') {
                curEl.props[prop] = input.value === 'true';
            } else if(isNaN(input.value)) {
                curEl.props[prop] = input.value;
            } else {
                curEl.props[prop] = Number(input.value);
            }
            curEl.setProps(curEl.props);
        }
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
        let optionsArray = [];
        const element = this.props.currentEl;
        const getOptionArray = (array) => _.map(array, (val) => (<option value={val} key={val}>{val}</option>));

        switch(type) {
            case 'signal':
                optionsList = getOptionArray([0, 1]);
                break;
            case 'range':
                if(prop === 'inContacts') {
                    for(let c = 2; c <= element.maxContacts; c++) {
                        optionsArray.push(c);
                    }
                    optionsList = getOptionArray(optionsArray);
                }
                break;
            case 'answer':
                optionsList = _.map(
                    ['No', 'Yes'],
                    (val) => {
                        const mean = val === 'Yes';

                        return (<option value={mean} key={val}>{val}</option>)
                    }
                );
                break;
            default:
                optionsList = (<option>Not specified</option>);
                break;
        }

        return optionsList;
    }

    getElementData() {
        const element = this.props.currentEl;
        const propsKeys = Object.keys(element.props)
        const contactsNum = _.get(element, 'props.inContacts', null);

        if(contactsNum) {
            for(let c = 1; c <= contactsNum; c++) {
                propsKeys.push(`invert${c}`);
            }
        }

        return propsKeys.map((prop) => {
            const key = `${element.name}_${prop}`;
            let type = _.get(DETAILS[prop], 'inputType', null);
            let name = _.get(DETAILS[prop], 'name', null);
            let valueType = _.get(DETAILS[prop], 'valueType', null);

            if((/invert\d+/).test(prop)) {
                name = DETAILS['invert'].name + prop.match(/\d+/)[0];
                type = DETAILS['invert'].inputType;
                valueType = DETAILS['invert'].valueType;
            }

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
