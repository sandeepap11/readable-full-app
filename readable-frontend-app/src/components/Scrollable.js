import React, { Component } from 'react';
import '../css/Scrollable.css';

class Scrollable extends Component {
    render() {
        return (

            <div className="fix-height">
                {this.props.children}
            </div>
        );
    }
}

export default Scrollable;