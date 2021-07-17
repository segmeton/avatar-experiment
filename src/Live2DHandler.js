import React from 'react';
import {Button, TextField, withStyles} from "@material-ui/core";
import {lightBlue} from "@material-ui/core/colors";
import thank_you_f from "./audio/thank_you_f.mp3";
import Message from "./utils/Message";
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
let listOfExpressions = ["normal", "very_happy", "disappointed", "sad_1", "happy", "surprised", "shy", "sad_2"];

class Live2DHandler extends React.Component {

    getInitialState = () => {
        return {loaded: false} //initially not loaded
    }

    constructor(props) {
        super(props);

        this.state = {
            ukiyoeName: 1,
            play: false,
            selectedEmotion: "normal",
            selectedEmotionIndex: 1,
            isSubmitButtonDisabled: true,
            receivedDescription: "",
            session: "describing", // describing || voting
            numberOfReceivedDescriptions: 0,
            dbEnabled: true
        }

        this.timer = 40000; // in ms

        this.msgObj = new Message(this.timer);

        this.usedExpression = ["disappointed", "sad_1", "normal", "happy", "very_happy"];

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount = () => {
        window.InitLive2DModel();

        this.msgObj.CountDown(this.CountDownCallback);

        window.onbeforeunload = function () {
            return true;
        };
    }

    CountDownCallback = () => {
        this.updateExpressionState(false);
        if(this.state.selectedEmotionIndex > 0){
            this.msgObj.CountDown(this.CountDownCallback);
        }
        console.log(this.usedExpression[this.state.selectedEmotionIndex]);
    }

    componentWillUnmount = () => {
        this.msgObj.ClearCountDown();
        window.onbeforeunload = null;
    }

    updateImages = () => {
        this.setState(() => ({
            ukiyoeName: Math.floor(Math.random() * 20) + 1
        }));
    }

    handleEmotionSelector = (event) => {
        this.updateEmotion(event.target.value)
    };

    updateEmotion = (value) => {
        this.setState(() => ({
            selectedEmotion: value
        }));

        console.log("Changing to: " + value)

        if (this.props.selectedGroup === "group_emotions") {
            window.ChangeExpression(value);
        }
    }

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

        // for testing
        //this.playSound();

        // window.ChangeExpression(listOfExpressions[Math.floor(Math.random() * listOfExpressions.length)]);
    }

    handleSubmit = () => {
        const numberOfReceivedDescriptions = this.state.numberOfReceivedDescriptions + 1;
        const receivedDescription = this.state.receivedDescription;

        //Add to database
        if(this.state.dbEnabled){
            db.ref(`descriptions`)
            .push({
                description: receivedDescription,
                participantID: this.props.participantID,
                imageID: this.getUkiyoeName()
            }).then(_ => {
                console.log("Added new description to DB")
            });
        }


        this.updateImages();

        this.playSound();

        //window.ChangeExpression(listOfExpressions[Math.floor(Math.random() * listOfExpressions.length)]);
       
        this.setState(() => ({
            isSubmitButtonDisabled: true,
            receivedDescription: "",
            numberOfReceivedDescriptions: numberOfReceivedDescriptions
        }));

        this.props.onDescriptionSubmitted()

        this.updateExpressionState(true);

        this.msgObj.CountDown(this.CountDownCallback);
    }

    updateExpressionState = (isUp) => {
        // 0 : negative
        // 1 : neutral
        // 2 : positive
        if(isUp){
            let newIndex = this.state.selectedEmotionIndex + 1;
            if(newIndex > 2){
                newIndex = 2;
            }
            if(newIndex <= 2){
                return this.updateSelectedEmotion(newIndex);
            }
            return null;
        }

        let newIndex = this.state.selectedEmotionIndex - 1;
        if(newIndex >= 0){
            return this.updateSelectedEmotion(newIndex);
        }
        return null;

        // if(this.state.selectedEmotion == "normal") {
        //      return this.updateEmotion("very_happy");
        // }

        // if(this.state.selectedEmotion == "very_happy") {
        //     return this.updateEmotion("sad_2");
        // }

        // if(this.state.selectedEmotion == "sad_2") {
        //     return this.updateEmotion("normal");
        // }         
    }

    updateSelectedEmotion = (newIndex) => {
        this.setState(() => ({
            selectedEmotionIndex: newIndex
        }));
        
        let newEmotion = 2;
       
        if(newIndex == 2){
            newEmotion = Math.floor(Math.random() * 2) + 3;
        }

        if(newIndex == 0){
            newEmotion = Math.floor(Math.random() * 2);
        }

        this.updateEmotion(this.usedExpression[newEmotion]);
        
    }

    playSound = () => {
        let thanks = document.getElementById("thanks");

        // let g = Math.floor(Math.random() * 2);
        // console.log(g);

        if(thanks !== undefined){
            // if(g == 0){
            //     thanks.src = require(`./audio/thank_you_f.mp3`).default;
            // }else{
            //     thanks.src = require(`./audio/thank_you_m.mp3`).default;
            // }
            thanks.play();
        }

    }

    keyPress = (e) => {
        if (e.keyCode === 13) {
            console.log('value', e.target.value);

            this.handleSubmit()
        }
    }

    render() {
        const ukiyoeName = this.getUkiyoeName();
        const thanks = "thank_you_f"

        // let emotionsSelector = [];
        // for (let i = 0; i < listOfExpressions.length; i++) {
        //     emotionsSelector.push(<MenuItem key={i} value={listOfExpressions[i]}>{listOfExpressions[i]}</MenuItem>);
        // }

        return (
            <div className="row">
                <div className="column col-6">
                    <div className="row">
                        <img className="ukiyoe-responsive" src={require(`./img/ukiyoe/${ukiyoeName}.jpg`).default}
                             alt="ukiyoe art"/>
                    </div>
                    <div className="row">
                        {/* {<Select
                            id="emotion-selector"
                            value={this.state.selectedEmotion}
                            onChange={this.handleEmotionSelector}
                            displayEmpty
                            fullWidth
                        >
                            {emotionsSelector}
                        </Select>} */}
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
                    <div>
                        <audio autoPlay loop id="bgm">
                        {/* <audio loop id="bgm"> */}
                            <source src={require(`./audio/sukiyaki_instrumental_${this.state.session}.mp3`).default} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                        <audio id="thanks">
                            <source src={require(`./audio/${thanks}.mp3`).default} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
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

