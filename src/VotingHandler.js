import React from 'react';
import {Button, CircularProgress, List, ListItem, ListItemText, Paper, TextField, withStyles} from "@material-ui/core";
import thank_you_f from "./audio/thank_you_f.mp3";
import Message from "./utils/Message";
import {db} from "./database/firebase";
import * as PropTypes from "prop-types";
import Alert from '@material-ui/lab/Alert';

const SkipButton = withStyles(() => ({
    root: {
        marginTop: "10px",
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

Alert.propTypes = {
    severity: PropTypes.string,
    children: PropTypes.node
};

class VotingHandler extends React.Component {

    getInitialState = () => {
        return {loaded: false} //initially not loaded
    }

    constructor(props) {
        super(props);

        this.state = {
            ukiyoeName: 1,
            ukiyoeAllImages: Array.from({length: 20}, (_, i) => i + 1),
            play: false,
            selectedEmotion: "normal",
            selectedEmotionIndex: 1,
            session: "voting", // describing || votin
            dbEnabled: true,
            loadedDescriptions: [],
            showLoadingIndicator: true,
            descriptionsSkippedInARow: 0
        }

        this.timer = 40000; // in ms

        this.msgObj = new Message(this.timer);

        this.usedExpression = ["disappointed", "sad_1", "normal", "happy", "very_happy"];

        this.state.ukiyoeAllImages.splice(0, 1);
        this.loadDescriptionsForUkiyoe(1)

        this.handleSelectedDescription = this.handleSelectedDescription.bind(this);
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
        if (this.state.selectedEmotionIndex > 0) {
            this.msgObj.CountDown(this.CountDownCallback);
        }
        console.log(this.usedExpression[this.state.selectedEmotionIndex]);
    }

    componentWillUnmount = () => {
        this.msgObj.ClearCountDown();
        window.onbeforeunload = null;
    }

    updateImages = () => {
        const items = this.state.ukiyoeAllImages
        console.log(items.length + " | " + items.toString())

        if(items.length > 0) {
            const nextImage = items[Math.floor(Math.random() * items.length)]
            this.setState(() => ({
                ukiyoeName: nextImage
            }));

            const index = items.indexOf(nextImage);
            items.splice(index, 1);

            this.setState(() => ({
                ukiyoeAllImages: items
            }));

            console.log(items.length + " | " + items.toString())

            this.loadDescriptionsForUkiyoe(nextImage)
        } else {
            //FINISH!
            console.log("Finished")

            this.props.onVotingFinished()
        }
    }

    updateEmotion = (value) => {
        this.setState(() => ({
            selectedEmotion: value
        }));

        console.log("Changing to: " + value)

        if (this.props.selectedGroup === "group_emotions") {
            window.ChangeExpression(value);
        }
    }

    getUkiyoeName = () => this.state.ukiyoeName
    emotionsSelector;

    handleSelectedDescription = (index) => {
        this.setState(() => ({
            showLoadingIndicator: true
        }));

        const result = this.state.loadedDescriptions[index]

        if (result.numberOfVotes == null) {
            result['numberOfVotes'] = 0
        }

        console.log("Selected description: " + result.key + " | " + result.description + " | " + result.numberOfVotes)

        if (this.state.dbEnabled) {
            db.ref(`descriptions/${result.key}`)
                .update({
                    numberOfVotes: result.numberOfVotes + 1
                })
                .then(() => {
                    console.log("Updated information about number of votes for description " + result.key)
                });
        }

        this.updateImages();

        this.updateExpressionState(true);
        this.playSound();
    }

    handleSkip() {
        this.setState(() => ({
            showLoadingIndicator: true,
            descriptionsSkippedInARow: this.state.descriptionsSkippedInARow + 1
        }));

        this.updateImages();

        console.log("Number of skips: " + this.state.descriptionsSkippedInARow)

        if (this.state.descriptionsSkippedInARow >= 5) {
            this.updateExpressionState(false);
        }

        /*this.setState(() => ({

        }));*/

        //this.props.onDescriptionSubmitted()

        //this.updateExpressionState(true);

        //this.msgObj.CountDown(this.CountDownCallback);
        // for testing
        //this.playSound();

        // window.ChangeExpression(listOfExpressions[Math.floor(Math.random() * listOfExpressions.length)]);
    }

    updateExpressionState = (isUp) => {
        // 0 : negative
        // 1 : neutral
        // 2 : positive
        if(isUp){
            let newIndex = this.state.selectedEmotionIndex + 1;
            if(newIndex > 4){
                newIndex = 4;
            }
            return this.updateSelectedEmotion(newIndex);
        }

        let newIndex = this.state.selectedEmotionIndex - 1;
        if(newIndex >= 0){
            return this.updateSelectedEmotion(newIndex);
        }
        return null;
    }

    updateSelectedEmotion = (newIndex) => {
        this.updateEmotion(this.usedExpression[newIndex]);
        this.setState(() => ({
            selectedEmotionIndex: newIndex
        }));
    }

    playSound = () => {
        let thanks = document.getElementById("thanks");

        // let g = Math.floor(Math.random() * 2);
        // console.log(g);

        if (thanks !== undefined) {
            // if(g == 0){
            //     thanks.src = require(`./audio/thank_you_f.mp3`).default;
            // }else{
            //     thanks.src = require(`./audio/thank_you_m.mp3`).default;
            // }
            thanks.play();
        }

    }

    loadDescriptionsForUkiyoe = (imageID) => {
        let loadedDescriptionsFromFirebase = []

        if (this.state.dbEnabled) {
            const self = this;
            db.ref('descriptions/').orderByChild('imageID').equalTo(imageID).on("value", function (snapshot) {
                snapshot.forEach(function (data) {
                    loadedDescriptionsFromFirebase.push(
                        {
                            "key": data.key,
                            "description": data.val().description,
                            "numberOfVotes": data.val().numberOfVotes
                        }
                    )
                });

                console.log("Descriptions for image " + imageID + ": ")

                loadedDescriptionsFromFirebase.forEach(desc => {
                    console.log(desc.key + " | " + desc.description)
                })

                self.setState(() => ({
                    loadedDescriptions: loadedDescriptionsFromFirebase,
                    showLoadingIndicator: false
                }));
            });
        }
    }

    render() {
        const ukiyoeName = this.getUkiyoeName();
        const thanks = "thank_you_f"
        const self = this

        return (
            <div className="row-voting">
                <div className="column topPane">
                    <img className="ukiyoe-responsive-voting"
                         src={require(`./img/ukiyoe/${ukiyoeName}.jpg`).default}
                         alt="ukiyoe art"/>
                    <div>
                        <h3>Select the best description for this image:</h3>
                        {this.state.showLoadingIndicator ? <CircularProgress color="secondary"/> :
                            <Paper style={{maxHeight: 200, overflow: 'auto'}}>
                                <List component="nav" fullWidth>
                                    {this.state.loadedDescriptions.length > 0 ? this.state.loadedDescriptions.map(function (object, i) {
                                        return <ListItem button onClick={() => {
                                            self.handleSelectedDescription(i)
                                        }}>
                                            <ListItemText primary={object.description.toString()}/>
                                        </ListItem>
                                    }) : <Alert style={{maxWidth: '100%'}} severity="info">No descriptions for this
                                        picture. Just press "Skip" to continue.</Alert>}
                                </List>
                            </Paper>}
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
                            <source src={require(`./audio/sukiyaki_instrumental_${this.state.session}.mp3`).default}
                                    type="audio/mpeg"/>
                            Your browser does not support the audio element.
                        </audio>
                        <audio id="thanks">
                            <source src={require(`./audio/${thanks}.mp3`).default} type="audio/mpeg"/>
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>

                <div className="column bottomPane">
                    <div id="for_canvas">
                    </div>
                </div>
            </div>
        );
    }
}

export default VotingHandler;

