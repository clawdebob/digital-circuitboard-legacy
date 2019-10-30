import React from "react";

class ElementDetails extends React.Component{
    constructor(props) {
        super(props);
        this.className = 'element-details';
        this.currentProp = null;
        this.handleClick = this.handleClick.bind(this);
        this.resetElementState = this.resetElementState.bind(this);
    }

    resetElementState() {
        const curEl = this.props.currentEl;
        let [input, span] = document.getElementsByName(this.currentProp);

        span.style.display = 'block';
        input.style.display = 'none';
        if(isNaN(input.value)) {
            curEl.props[this.currentProp] = input.value;
        } else {
            curEl.props[this.currentProp] = Number(input.value);
        }

        curEl.setProps(curEl.props);

        this.props.handleChange(curEl);
        document.removeEventListener('click', this.resetElementState);
    }

    handleClick(e, prop) {
        let [input, span] = document.getElementsByName(prop);
        span.style.display = 'none';
        input.style.display = 'block';

        this.currentProp = prop;
        if (prop !== this.currentProp && this.currentProp) {
            this.resetElementState();
        }

        input.focus();
        document.addEventListener('click', this.resetElementState);
    }

    getElementData() {
        const element = this.props.currentEl;

        return Object.keys(element.props).map((prop, ind) => {
            const key = `${element.name}_${prop}`;
            return (
                <tr key={key}>
                    <td key={prop}>{prop}</td>
                    <td
                        onClick={(e) => this.handleClick(e, prop)}
                        key={key}
                    >
                        <input
                            type="text"
                            defaultValue={element.props[prop]}
                            name={prop}
                            key={key}
                        />
                        <span
                            className={`${this.className}__prop-value`}
                            name={prop}
                            key={ind}
                        >
                            {element.props[prop]}
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
                        <caption className={`${this.className}__title`}>Element Properties</caption>
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
