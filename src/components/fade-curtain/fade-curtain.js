import React from 'react';

class FadeCurtain extends React.Component {
    render(){
        const element = this.props.visible ? (
            <div className="fade-curtain">
                {this.props.innerContent}
            </div>
        ) : null;

        return element;
    }
}

export default FadeCurtain;
