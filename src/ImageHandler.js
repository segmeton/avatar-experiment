import React from 'react';
import ReactDOM from 'react-dom';

const imagesPath = {
    minus: "http://lorempixel.com/400/200/city/1",
    plus: "http://lorempixel.com/400/200/city/2"
  }
  
class ImageHandler extends React.Component {
    state = {
        open: true
    }
    toggleImage = () => {
        this.setState(state => ({ open: !state.open }))
    }
  
    getImageName = () => this.state.open ? 'plus' : 'minus'
  
    render() {
        const imageName = this.getImageName();
        return (
        <div>
            <img style={{maxWidth: '400px'}} src={imagesPath[imageName]} onClick={this.toggleImage} />
        </div>
      );
    }
}

export default ImageHandler;