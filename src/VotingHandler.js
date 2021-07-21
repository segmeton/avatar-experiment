import React from 'react';
import {
    Button,
    FormControl, FormHelperText, InputLabel,
    MenuItem,
    Select,
    TextField,
    withStyles
} from "@material-ui/core";
import thank_you_f from "./audio/thank_you_f.mp3";
import Message from "./utils/Message";
import Round from "./utils/Round";
import {db} from "./database/firebase";
import * as PropTypes from "prop-types";
import Alert from '@material-ui/lab/Alert';
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

        // let sets = this.generateSets();
        let sets = this.getStaticSet();

        this.state = {
            // ukiyoeName: Math.floor(Math.random() * 20) + 1,
            ukiyoeName: sets[0][0],
            ukiyoeAllImages: Array.from({length: 20}, (_, i) => i + 1),
            ukiyoeAllImageSets: this.getStaticSet(),
            play: false,
            selectedEmotion: "normal",
            selectedEmotionIndex: 1,
            session: "voting", // describing || voting
            dbEnabled: true,
            loadedDescriptions: [],
            showLoadingIndicator: true,
            descriptionsSkippedInARow: 0,
            currentRound: 1,
            selectedImage: 0
        }

        this.timer = 10000; // in ms

        this.roundTimer = 30000; // in ms

        this.msgObj = new Message(this.timer);

        this.roundObj = new Round(this.roundTimer);

        this.usedExpression = ["disappointed", "normal", "very_happy"];

        this.loadDescriptionsForUkiyoe(sets[0][0])

        this.handleSelectedDescription = this.handleSelectedDescription.bind(this);
    }

    componentDidMount = () => {
        window.InitLive2DModel();

        this.msgObj.CountDown(this.CountDownCallback);

        this.roundObj.CountDown(this.roundEndsCallback);

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

    roundEndsCallback = () => {
        let nextRound = this.state.currentRound + 1;

        console.log("next round : " + nextRound);

        console.log(nextRound);
        if (nextRound < this.state.maxRound + 1) {
            this.props.onRoundEnd(this.state.maxRound - nextRound)
            this.roundObj.CountDown(this.roundEndsCallback);

            // let nextImage = this.state.ukiyoeAllImageSets[nextRound-1][0]

            this.setState(() => ({
                currentRound: nextRound
            }));

        } else {

            this.props.onGameOver();
        }
    }

    componentWillUnmount = () => {
        this.msgObj.ClearCountDown();
        this.roundObj.ClearCountDown();
        window.onbeforeunload = null;
    }

    generateSets = () => {
        let arr = [];
        let output = [];
        let chunkSize = 3;
        while (arr.length < 15) {
            var r = Math.floor(Math.random() * 20) + 1;
            if (arr.indexOf(r) === -1) arr.push(r);
        }

        for (let i = 0; i < arr.length; i += chunkSize) {
            var chunk = arr.slice(i, i + chunkSize);
            output.push(chunk);
        }

        return output;
    }

    getStaticSet = () => {
        let arr = [
            [17, 20, 1],
            [7, 14, 10],
            [19, 9, 18],
            [4, 16, 2],
            [13, 15, 2]
        ];

        for (let i = 0; i < arr.length; i++) {
            arr[i] = this.shuffleArray(arr[i]);
        }

        arr = this.shuffleArray(arr);

        return arr;
    }

    shuffleArray = (array) => {
        let output = array;
        for (let i = output.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [output[i], output[j]] = [output[j], output[i]];
        }
        return output;
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

    getUkiyoeName = () => this.state.ukiyoeName;

    getUkiyoeSetName = () => {
        return this.state.ukiyoeAllImageSets[this.state.currentRound - 1];
    }

    handleSelectedDescription = (index) => {
        this.setState(() => ({
            showLoadingIndicator: true,
            descriptionsSkippedInARow: 0
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

        //this.updateImages(true);

        //this.props.onVoteSubmitted(this.state.ukiyoeAllImages.length)

        this.updateExpressionState(true);
        this.playSound();

        this.updateImages(true);
    }

    updateExpressionState = (isUp) => {
        // 0 : negative
        // 1 : neutral
        // 2 : positive
        if (isUp) {
            let newIndex = this.state.selectedEmotionIndex + 1;
            if (newIndex > 2) {
                newIndex = 2;
            }
            if (newIndex <= 2) {
                return this.updateSelectedEmotion(newIndex);
            }

            return this.updateSelectedEmotion(newIndex);
        }

        let newIndex = this.state.selectedEmotionIndex - 1;
        if (newIndex < 0) {
            newIndex = 0;
        }
        if (newIndex >= 0) {
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

        if (thanks !== undefined) {
            thanks.play();
        }
    }

    handleDescriptionSelector = (event) => {
        this.setState(() => ({
            selectedDescription: event.target.value
        }));
    }

    handleImageSelector = (event) => {
        const selectedImage = event.target.value

        this.setState(() => ({
            selectedImage: selectedImage
        }));

        const receivedVal = this.getUkiyoeSetName()[selectedImage]
        console.log(receivedVal)
        this.loadDescriptionsForUkiyoe(receivedVal)


        //for(let i = 0; i < this.getUkiyoeSetName().length; i += 1) {
        console.log(this.getUkiyoeSetName())
        //}
    }

    updateImages = (isSubmit) => {
        const items = this.state.ukiyoeAllImages
        console.log(items.length + " | " + items.toString())

        if(isSubmit){
            const index = items.indexOf(this.state.ukiyoeName);
            items.splice(index, 1);
            this.setState(() => ({
                ukiyoeAllImages: items
            }));
        }

        if(items.length > 0) {

            const nextImage = items[Math.floor(Math.random() * items.length)]
            this.setState(() => ({
                ukiyoeName: nextImage
            }));

            console.log(items.length + " | " + items.toString())
        } else {
            this.props.onDescriptionsFinished()
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
        const ukiyoeNameSet = this.getUkiyoeSetName();
        console.log("UKIYO-E SET: " + ukiyoeNameSet)
        const thanks = "thank_you_f"

        return (
            <div className="content">
                <div className="row">
                    <div className="column col-9">
                        <div className="row">
                            <div className="column col-4">
                                <div className="row">
                                    <img className="ukiyoe-responsive"
                                         src={require(`./img/justin/${ukiyoeNameSet[0]}.jpg`).default}
                                         alt="ukiyoe art"/>
                                </div>
                            </div>
                            <div className="column col-4">
                                <div className="row">
                                    <img className="ukiyoe-responsive"
                                         src={require(`./img/justin/${ukiyoeNameSet[1]}.jpg`).default}
                                         alt="ukiyoe art"/>
                                </div>
                            </div>
                            <div className="column col-4">
                                <div className="row">
                                    <img className="ukiyoe-responsive"
                                         src={require(`./img/justin/${ukiyoeNameSet[2]}.jpg`).default}
                                         alt="ukiyoe art"/>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <FormControl style={{margin: '10px'}}>
                                <InputLabel id="demo-simple-select-helper-label">Image</InputLabel>
                                <Select
                                    id="emotion-selector"
                                    value={this.state.selectedImage}
                                    onChange={this.handleImageSelector}
                                    fullWidth
                                >
                                    <MenuItem value={0}>First</MenuItem>
                                    <MenuItem value={1}>Second</MenuItem>
                                    <MenuItem value={2}>Third</MenuItem>
                                </Select>
                                <FormHelperText>Select one of 3 images to see descriptions</FormHelperText>
                            </FormControl>
                            <FormControl style={{margin: '10px'}}>
                                <InputLabel id="demo-simple-select-helper-label">Description</InputLabel>
                                <Select
                                    id="emotion-selector"
                                    value={this.state.selectedDescription}
                                    onChange={this.handleDescriptionSelector}
                                    fullWidth
                                >
                                    {this.state.loadedDescriptions.length > 0 ? this.state.loadedDescriptions.map(function (object, i) {
                                        return <MenuItem value={i}>
                                            {object.description.toString()}
                                        </MenuItem>
                                    }) : <Alert style={{maxWidth: '100%'}} severity="info">No descriptions for this
                                        picture. Just press "Skip" to continue.</Alert>}
                                </Select>
                                <FormHelperText>Select your favorite description for a selected image</FormHelperText>
                            </FormControl>
                            <ColorButton
                                disabled={this.state.isSubmitButtonDisabled}
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    this.handleSelectedDescription(this.state.selectedDescription)
                                }}>
                                Submit 送信
                            </ColorButton>
                        </div>
                    </div>
                    <div className="column col-3">
                        <div id="for_canvas">
                        </div>
                    </div>
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
        );
    }
}

export default VotingHandler;

