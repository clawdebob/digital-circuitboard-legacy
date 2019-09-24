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
        let [input, span] = document.getElementsByName(this.currentProp);
        console.log(input.value);
        span.style.display = 'block';
        input.style.display = 'none';
        const props = JSON.parse(JSON.stringify(this.props.currentEl));
        props[this.currentProp] = input.value;
        this.props.handleChange(props);
        document.removeEventListener('click', this.resetElementState)
    }

    handleClick(e, prop) {
        let [input, span] = document.getElementsByName(prop);
        span.style.display = 'none';
        input.style.display = 'block';
        if (prop !== this.currentProp && this.currentProp) {
            this.resetElementState();
        }
        this.currentProp = prop;

        input.focus();
        document.addEventListener('click', this.resetElementState);
    }

    getElementData() {
        const element = this.props.currentEl;

        return Object.keys(element).map((prop, ind) => {
            return (
                <tr>
                    <td>{prop}</td>
                    <td onClick={(e) => this.handleClick(e, prop)}>
                        <input
                            type="text"
                            defaultValue={this.props.currentEl[prop]}
                            name={prop}
                        />
                        <span
                            className={`${this.className}__prop-value`}
                            name={prop}>{element[prop]}
                        </span>
                    </td>
                </tr>
            );
        });
    }

    render() {
        if (this.props.currentEl) {
            this.originalData = JSON.parse(JSON.stringify(this.props.currentEl));
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
