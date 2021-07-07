import React from 'react';
import ReactDOM from 'react-dom';

class ImageHandler extends React.Component {


    
    constructor(props) {
        super(props);
        
        this.state = {
            avatarName: 1,
            ukiyoeName: 1,
            play: false
        }

        this.ticks = 1000;
    
        // this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);


    }

    
    componentDidMount() {
        this.timeOut();
        // this.audio.addEventListener('ended', () => this.setState({ play: false }));
    }

    componentWillUnmount() {
        // this.audio.removeEventListener('ended', () => this.setState({ play: false }));  
    }

    // togglePlay = () => {
    //     this.setState({ play: !this.state.play }, () => {
    //         this.state.play ? this.audio.play() : this.audio.pause();
    //     });
    // }

    tickTimesOut() {
        this.setState((prevState, props) => ({
            avatarName: prevState.avatarName - 1 == 0 ? 1 : prevState.avatarName - 1
        }));
    
        this.ticks = 5000
    
        this.timeOut()
    }

    timeOut = () => {
        this.timeoutID = setTimeout(
            () => this.tickTimesOut(),
            this.ticks
        );
    }
    
    updateImages = () => {
        this.setState((prevState, props) => ({
            avatarName: prevState.avatarName + 1 > 5 ? 5 : prevState.avatarName + 1,
            ukiyoeName: Math.floor(Math.random() * 20) + 1
        }));
    }

    getAvatarName = () => this.state.avatarName

    getUkiyoeName = () => this.state.ukiyoeName

    handleSubmit(event) {
        // alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
        this.updateImages();

        this.url = "./audio/thank_you.mp3";
        // this.audio = new Audio(this.url);
        this.audio = new Audio(require("./audio/thank_you_f.mp3").default);
        this.audio.crossOrigin = 'anonymous';
        // audio = new Audio(this.props.url)

        this.audio.play();

        // if(!this.state.play) {
        //     this.audio.play();
        //     console.log("play sound");
        // }
        
        
    }

    render() {

        const avatarName = this.getAvatarName();
        const ukiyoeName = this.getUkiyoeName();

        return(
            
            <div className="row">
                <div className="column col-6">
                    <div className="row">
                        <img className="ukiyoe-responsive" src={ require(`./img/ukiyoe/${ukiyoeName}.jpg`).default } />
                    </div>
                    <div className="row">
                        <form  onSubmit={this.handleSubmit}>
                            <label>
                                <input type="text" name="description" />
                            </label>
                            <input type="submit" value="Submit" />
                        </form>
                        {/* <audio src={ require(`./img/ukiyoe/${ukiyoeName}.jpg`).default } controls autoPlay/> */}
                    </div>
                </div>

                <div className="column col-6">
                    <img className="img-responsive" src={ require(`./img/avatar/${avatarName}.png`).default } />
                </div>
            </div>
        );
    }
}

// const imagesPath = {
//     minus: "http://lorempixel.com/400/200/city/1",
//     plus: "http://lorempixel.com/400/200/city/2"
//   }
  
// class ImageHandler extends React.Component {
//     state = {
//         open: true
//     }
//     toggleImage = () => {
//         this.setState(state => ({ open: !state.open }))
//     }
  
//     getImageName = () => this.state.open ? 'plus' : 'minus'
  
//     render() {
//         const imageName = this.getImageName();
//         return (
//         <div>
//             <img style={{maxWidth: '400px'}} src={imagesPath[imageName]} onClick={this.toggleImage} />
//         </div>
//       );
//     }
// }

export default ImageHandler;