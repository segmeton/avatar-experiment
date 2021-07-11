import React from 'react';
import {Button, MenuItem, Select, TextField, withStyles} from "@material-ui/core";
import {lightBlue} from "@material-ui/core/colors";

const ColorButton = withStyles(() => ({
    root: {
        color: "white",
        backgroundColor: lightBlue[500],
        '&:hover': {
            backgroundColor: lightBlue[700],
        },
        margin: "10px",
        display: "block"
    },
}))(Button);

const SkipButton = withStyles(() => ({
    root: {
        margin: "10px",
        display: "block"
    },
}))(Button);

const ColorInput = withStyles(() => ({
    root: {
        display: "block",
        margin: "10px",
        '& label.Mui-focused': {
            color: 'lightblue',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'lightblue',
        },
        '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
                borderColor: 'lightblue',
            },
        },
    },
}))(TextField);

//list of available expressions
let listOfExpressions = ["normal", "very_happy", "disappointed", "sad_1", "happy", "surprised", "shy", "sad_2"]

class Live2DHandler extends React.Component {

    getInitialState() {
        return {loaded: false} //initially not loaded
    }

    constructor(props) {
        super(props);

        this.state = {
            ukiyoeName: 1,
            play: false,
            selectedEmotion: "normal"
        }

        this.ticks = 1000;

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    updateImages = () => {
        this.setState(() => ({
            ukiyoeName: Math.floor(Math.random() * 20) + 1
        }));
    }

    handleEmotionSelector = (event) => {
        this.setState(() => ({
            selectedEmotion: event.target.value
        }));

        console.log("Changing to: " + event.target.value)
        window.ChangeExpression(event.target.value);
    };

    getUkiyoeName = () => this.state.ukiyoeName
    emotionsSelector;

    handleSubmit() {
        this.updateImages();

        this.url = "./audio/thank_you.mp3";
        this.audio = new Audio(require("./audio/thank_you_f.mp3").default);
        this.audio.crossOrigin = 'anonymous';

        this.audio.play();

        window.ChangeExpression(listOfExpressions[Math.floor(Math.random() * listOfExpressions.length)]);
    }

    render() {
        const ukiyoeName = this.getUkiyoeName();

        let emotionsSelector = [];
        for (let i = 0; i < listOfExpressions.length; i++) {
            emotionsSelector.push(<MenuItem key={i} value={listOfExpressions[i]}>{listOfExpressions[i]}</MenuItem>);
        }

        return (
            <div className="row">
                <div className="column col-6">
                    <div className="row">
                        <img className="ukiyoe-responsive" src={require(`./img/ukiyoe/${ukiyoeName}.jpg`).default}
                             alt="ukiyoe art"/>
                    </div>
                    <div className="row">
                        <Select
                            id="emotion-selector"
                            value={this.state.selectedEmotion}
                            onChange={this.handleEmotionSelector}
                            displayEmpty
                            fullWidth
                        >
                            {emotionsSelector}
                        </Select>
                        <ColorInput
                            color="red"
                            fullWidth
                            id="outlined-basic"
                            label="Your description"
                            variant="outlined"/>
                        <ColorButton
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                this.handleSubmit()
                            }}>
                            Submit description
                        </ColorButton>

                        <SkipButton
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                this.handleSubmit()
                            }}>
                            Skip
                        </SkipButton>
                    </div>
                </div>

                <div className="column col-6">
                    <div id="for_canvas">
                    </div>
                </div>
            </div>
        );
    }
}

export default Live2DHandler;

