import React from 'react';
import {Button, CircularProgress, List, ListItem, ListItemText, Paper, TextField, withStyles} from "@material-ui/core";
import thank_you_f from "./audio/thank_you_f.mp3";
import Message from "./utils/Message";
import Round from "./utils/Round";
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

        // let sets = this.generateSets();
        let sets = this.getStaticSet();

        this.state = {
            // ukiyoeName: Math.floor(Math.random() * 20) + 1,
            ukiyoeName: sets[0][0],
            ukiyoeAllImages: Array.from({length: 20}, (_, i) => i + 1),
            ukiyoeAllImageSets: sets,
            play: false,
            selectedEmotion: "normal",
            selectedEmotionIndex: 1,
            session: "voting", // describing || voting
            dbEnabled: true,
            loadedDescriptions: [],
            showLoadingIndicator: true,
            descriptionsSkippedInARow: 0
        }

        this.timer = 10000; // in ms

        this.roundTimer = 30000; // in ms

        this.msgObj = new Message(this.timer);

        this.roundObj = new Round(this.roundTimer);

        this.usedExpression = ["disappointed", "normal", "very_happy"];

        this.state.ukiyoeAllImages.splice(0, 1);
        this.loadDescriptionsForUkiyoe(1)

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
        // console.log(this.state.ukiyoeAllImageSets);
        // console.log(this.state.ukiyoeAllImageSets[nextRound-1]);
        // console.log(this.state.ukiyoeAllImageSets[nextRound-1][0]);
        // this.setState((nextRound, nextImage) => ({
        //     currentRound: nextRound,
        //     ukiyoeName: nextImage,
        // }));

        console.log(nextRound);
        if (nextRound < this.state.maxRound + 1)
        {
            this.props.onRoundEnd(this.state.maxRound-nextRound)
            this.roundObj.CountDown(this.roundEndsCallback);

            // let nextImage = this.state.ukiyoeAllImageSets[nextRound-1][0]

            this.setState(() => ({
                currentRound: nextRound
            }));
    
        }
        else{

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
        while(arr.length < 15){
            var r = Math.floor(Math.random() * 20) + 1;
            if(arr.indexOf(r) === -1) arr.push(r);
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

        for(let i = 0; i < arr.length; i++){
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

    getUkiyoeSetName = () => {
        let arr = this.state.ukiyoeAllImageSets[this.state.currentRound-1]
        return arr;
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

        this.updateImages(true);

        this.props.onVoteSubmitted(this.state.ukiyoeAllImages.length)

        this.updateExpressionState(true);
        this.playSound();
    }

    handleSkip() {
        this.setState(() => ({
            showLoadingIndicator: true,
            descriptionsSkippedInARow: this.state.descriptionsSkippedInARow + 1
        }));

        this.updateImages(false);

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
        // if(isUp){
        //     let newIndex = this.state.selectedEmotionIndex + 1;
        //     if(newIndex > 4){
        //         newIndex = 4;
        //     }
        //     return this.updateSelectedEmotion(newIndex);
        // }

        // let newIndex = this.state.selectedEmotionIndex - 1;
        // if(newIndex >= 0){
        //     return this.updateSelectedEmotion(newIndex);
        // }
        // return null;

        if(isUp){
            let newIndex = this.state.selectedEmotionIndex + 1;
            if(newIndex > 2){
                newIndex = 2;
            }
            if(newIndex <= 2){
                return this.updateSelectedEmotion(newIndex);
            }
            //roman code
            // if(newIndex > 4){
            //     newIndex = 4;
            // }
            // 

            return this.updateSelectedEmotion(newIndex);
        }

        let newIndex = this.state.selectedEmotionIndex - 1;
        if(newIndex < 0){
            newIndex = 0;
        }
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

        // this.setState(() => ({
        //     selectedEmotionIndex: newIndex
        // }));
        
        // let newEmotion = 2;
       
        // if(newIndex === 2){
        //     newEmotion = Math.floor(Math.random() * 2) + 3;
        // }

        // if(newIndex === 0){
        //     newEmotion = Math.floor(Math.random() * 2);
        // }

        // this.updateEmotion(this.usedExpression[newEmotion]);
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
        // const ukiyoeName = this.getUkiyoeName();
        const ukiyoeNameSet = this.getUkiyoeSetName();
        const thanks = "thank_you_f"
        const self = this

        return (
            <div className="content">
                <div className="row-voting">
                    <div className="column topPane">
                        <img className="ukiyoe-responsive-voting"
                            src={require(`./img/justin/${ukiyoeNameSet[0]}.jpg`).default}
                            alt="ukiyoe art"/>
                        <img className="ukiyoe-responsive-voting"
                            src={require(`./img/justin/${ukiyoeNameSet[0]}.jpg`).default}
                            alt="ukiyoe art"/>
                        <img className="ukiyoe-responsive-voting"
                            src={require(`./img/justin/${ukiyoeNameSet[0]}.jpg`).default}
                            alt="ukiyoe art"/>
                        <div>
                            <h3>Select the best description for this image. (この画像に最も良い説明文を選択してください。)</h3>
                            <span>Click on the description to vote. (説明文をクリックして投票してください。)</span>
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
                                            picture. Just press "Skip" to continue. (この写真の説明はありません。 「スキップ」を押すだけで続行できます。)</Alert>}
                                    </List>
                                </Paper>}
                            {/* <SkipButton
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    this.handleSkip()
                                }}>
                                Skip スキップ
                            </SkipButton> */}
                        </div>
                        
                    </div>
                    <div className="column bottomPane">
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

