import React from 'react';
import {Button, MenuItem, Select, TextField, withStyles} from "@material-ui/core";
import {lightBlue} from "@material-ui/core/colors";
import {db} from "./database/firebase";

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

export const ColorInput = withStyles(() => ({
    root: {
        display: "block",
        marginTop: "10px",
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
            selectedEmotion: "normal",
            isSubmitButtonDisabled: true,
            receivedDescription: "",
            numberOfReceivedDescriptions: 0
        }

        this.ticks = 1000;

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        window.InitLive2DModel()

        window.onbeforeunload = function () {
            return true;
        };
    }

    componentWillUnmount() {
        window.onbeforeunload = null;
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

    handleDescriptionInput = (event) => {
        let receivedDescription = event.target.value

        this.setState(() => ({
            isSubmitButtonDisabled: (!(receivedDescription.toString().length > 0)),
            receivedDescription: receivedDescription
        }));
    }

    getUkiyoeName = () => this.state.ukiyoeName
    emotionsSelector;

    handleSkip() {
        this.updateImages();
        this.props.onSkipButtonClicked()

        window.ChangeExpression(listOfExpressions[Math.floor(Math.random() * listOfExpressions.length)]);
    }

    handleSubmit = () => {
        const numberOfReceivedDescriptions = this.state.numberOfReceivedDescriptions + 1;
        const receivedDescription = this.state.receivedDescription;

        //Add to database
        db.ref(`descriptions`)
            .push({
                description: receivedDescription,
                participantID: this.props.participantID,
                imageID: this.getUkiyoeName()
            }).then(_ => {
            console.log("Added new description to DB")
        })

        this.updateImages();

        this.url = "./audio/thank_you.mp3";
        this.audio = new Audio(require("./audio/thank_you_f.mp3").default);
        this.audio.crossOrigin = 'anonymous';

        this.audio.play();

        window.ChangeExpression(listOfExpressions[Math.floor(Math.random() * listOfExpressions.length)]);

        this.setState(() => ({
            isSubmitButtonDisabled: true,
            receivedDescription: "",
            numberOfReceivedDescriptions: numberOfReceivedDescriptions
        }));

        this.props.onDescriptionSubmitted()
    }

    keyPress = (e) => {
        if (e.keyCode === 13) {
            console.log('value', e.target.value);

            this.handleSubmit()
        }
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
                        {<Select
                            id="emotion-selector"
                            value={this.state.selectedEmotion}
                            onChange={this.handleEmotionSelector}
                            displayEmpty
                            fullWidth
                        >
                            {emotionsSelector}
                        </Select>}
                        <ColorInput
                            onKeyDown={this.keyPress}
                            value={this.state.receivedDescription}
                            fullWidth
                            id="outlined-basic"
                            label="Your description"
                            variant="outlined"
                            onChange={this.handleDescriptionInput}/>
                        <ColorButton
                            disabled={this.state.isSubmitButtonDisabled}
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
                                this.handleSkip()
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

