import React from 'react';
import {Button, TextField, withStyles} from "@material-ui/core";
import {lightBlue} from "@material-ui/core/colors";
import thank_you_f from "./audio/thank_you_f.mp3";
import Message from "./utils/Message";
import Round from "./utils/Round";
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

        // let sets = this.generateSets();
        let sets = this.getStaticSet();

        this.state = {
            // ukiyoeName: Math.floor(Math.random() * 20) + 1,
            ukiyoeAllImages: Array.from({length: 20}, (_, i) => i + 1),
            ukiyoeName: sets[0][0],
            ukiyoeAllImageSets: sets,
            play: false,
            selectedEmotion: "normal",
            selectedEmotionIndex: 1,
            isSubmitButtonDisabled: true,
            receivedDescription: "",
            session: "describing", // describing || voting
            numberOfReceivedDescriptions: 0,
            dbEnabled: true,
            descriptionsSkippedInARow: 0,
            currentRound: 1,
            maxRound: 5,
            errorMessage: null,
            imgDescribed: [false, false, false]
        }


        this.timer = 26667; // in ms

        this.roundTimer = 80000; // in ms

        this.msgObj = new Message(this.timer);

        this.roundObj = new Round(this.roundTimer);

        this.usedExpression = ["disappointed", "normal", "very_happy"];

        // this.state.ukiyoeAllImages.splice(0, 1);

        this.handleSubmit = this.handleSubmit.bind(this);
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
        if(JSON.stringify(this.state.imgDescribed)==JSON.stringify([true, true, true])){
            return null;
        }
        this.updateExpressionState(false);
        if(this.state.selectedEmotionIndex > 0){
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
                currentRound: nextRound,
                errorMessage: null,
                imgDescribed: [false, false, false]
            }));

            // 0 : negative
            // 1 : neutral
            // 2 : positive
            this.updateSelectedEmotion(1);

            this.msgObj.CountDown(this.CountDownCallback);
    
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
            [13, 15, 5]
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
        } else {
            this.props.onDescriptionsFinished()
        }
    }

    updateRandomImages = () => {
        this.setState(() => ({
            ukiyoeName: Math.floor(Math.random() * 20) + 1
        }));
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

    handleDescriptionInput = (event) => {
        let receivedDescription = event.target.value

        this.setState(() => ({
            isSubmitButtonDisabled: (!(receivedDescription.toString().length > 0)),
            receivedDescription: receivedDescription
        }));
    }

    getUkiyoeName = () => this.state.ukiyoeName
    emotionsSelector;

    getUkiyoeSetName = () => {
        return this.state.ukiyoeAllImageSets[this.state.currentRound - 1];
    }

    handleSkip() {
        this.updateImages(false);
        this.props.onSkipButtonClicked()

        this.setState(() => ({
            descriptionsSkippedInARow: this.state.descriptionsSkippedInARow + 1
        }))

        console.log("Number of skips: " + this.state.descriptionsSkippedInARow)

        if (this.state.descriptionsSkippedInARow >= 3) {
            this.updateExpressionState(false);
        }
    }

    handleSubmit = () => {
        const numberOfReceivedDescriptions = this.state.numberOfReceivedDescriptions + 1;
        const receivedDescription = this.state.receivedDescription;
        const ukiyoeNameSet = this.getUkiyoeSetName();

        let imgDescribed = this.state.imgDescribed;

        if(JSON.stringify(imgDescribed)==JSON.stringify([true, true, true])){
            this.playSound("error-wait");
            this.setState(() => ({
                errorMessage: "You have described every image. Please wait for the next set! すべての画像を説明しました。 次のセットをお待ちください！"
            }));
            return null;
        }

        let regex = new RegExp('(.*):(.*)');
        let result = regex.exec(receivedDescription);
        
        console.log(result);

        if(result === null){
            this.playSound("error-format");
            this.setState(() => ({
                errorMessage: "Please use the correct format! 正しいフォーマットを使用してください！"
            }));
            return null;
        }

        let description = result[2]; 

        regex = new RegExp('[ABC]');
        let resultImgID = regex.exec(result[1]);

        console.log(resultImgID);

        if(resultImgID === null){
            this.playSound("error-imgid");
            this.setState(() => ({
                errorMessage: "Please use the correct imageID! 正しい画像IDを使用してください！"
            }));
            return null;
        }
        
        let imgID = 0;

        if(resultImgID[0] == "A"){
            if(imgDescribed[0]){
                this.playSound("error-multi");
                this.setState(() => ({
                    errorMessage: "You have described this image. Please describe the other image(s)! この画像を説明しました。 他の画像にを説明してください。"
                }));
                return null;
            }
            imgDescribed[0] = true;
            imgID = ukiyoeNameSet[0];
        }else if(resultImgID[0] == "B"){
            if(imgDescribed[1]){
                this.playSound("error-multi");
                this.setState(() => ({
                    errorMessage: "You have described this image. Please describe the other image(s)! この画像を説明しました。 他の画像にを説明してください。"
                }));
                return null;
            }
            imgDescribed[1] = true;
            imgID = ukiyoeNameSet[1];
        }else{
            if(imgDescribed[2]){
                this.playSound("error-multi");
                this.setState(() => ({
                    errorMessage: "You have described this image. Please describe the other image(s)! この画像を説明しました。 他の画像にを説明してください。"
                }));
                return null;
            }
            imgDescribed[2] = true;
            imgID = ukiyoeNameSet[2];
        }

        console.log(imgID);
        console.log(imgDescribed);

        //Add to database
        if(this.state.dbEnabled){
            db.ref(`descriptions`)
            .push({
                // description: receivedDescription,
                description: description,
                participantID: this.props.participantID,
                // imageID: this.getUkiyoeName(),
                imageID: imgID,
                date: new Date().toLocaleString()
            }).then(_ => {
                console.log("Added new description to DB")
            });
        }

        // this.updateImages(true);

        this.playSound("thanks");

        //window.ChangeExpression(listOfExpressions[Math.floor(Math.random() * listOfExpressions.length)]);
       
        this.setState(() => ({
            isSubmitButtonDisabled: true,
            receivedDescription: "",
            numberOfReceivedDescriptions: numberOfReceivedDescriptions,
            descriptionsSkippedInARow: 0,
            errorMessage: null,
            imgDescribed: imgDescribed
        }));

        this.props.onDescriptionSubmitted(this.state.ukiyoeAllImages.length)

        this.updateExpressionState(true);

        if(JSON.stringify(imgDescribed)==JSON.stringify([true, true, true])){
            this.msgObj.ClearCountDown();
            console.log("clear coundt down");
        }
        else{
            this.msgObj.CountDown(this.CountDownCallback);
        }
        
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
        this.setState(() => ({
            selectedEmotionIndex: newIndex
        }));

        this.updateEmotion(this.usedExpression[newIndex]);
        
        // let newEmotion = 2;
       
        // if(newIndex === 2){
        //     newEmotion = Math.floor(Math.random() * 2) + 3;
        // }

        // if(newIndex === 0){
        //     newEmotion = Math.floor(Math.random() * 2);
        // }

        // this.updateEmotion(this.usedExpression[newEmotion]);
        
    }

    playSound = (elementID) => {
        let audio = document.getElementById(elementID);

        // let g = Math.floor(Math.random() * 2);
        // console.log(g);

        if(audio !== undefined){
            // if(g == 0){
            //     thanks.src = require(`./audio/thank_you_f.mp3`).default;
            // }else{
            //     thanks.src = require(`./audio/thank_you_m.mp3`).default;
            // }
            audio.play();
        }

    }

    keyPress = (e) => {
        if (e.keyCode === 13) {
            console.log('value', e.target.value);

            this.handleSubmit()
        }
    }

    render() {
        // const ukiyoeName = this.getUkiyoeName();
        const ukiyoeNameSet = this.getUkiyoeSetName();
        const thanks = "thank_you_f";
        const errorFormat = "error-format";
        const errorImgID = "error-imgid";
        const errorMulti = "error-multi";
        const errorWait = "error-wait";

        // let emotionsSelector = [];
        // for (let i = 0; i < listOfExpressions.length; i++) {
        //     emotionsSelector.push(<MenuItem key={i} value={listOfExpressions[i]}>{listOfExpressions[i]}</MenuItem>);
        // }

        return (
            <div className="content">
                <div className="row">
                    <div className="column col-9">
                        <div className="row">
                            <div className="column col-4">
                                <div className="row-flex-center">
                                    <img className="ukiyoe-responsive" src={require(`./img/justin/${ukiyoeNameSet[0]}.jpg`).default}
                                        alt="ukiyoe art"/>
                                </div>
                                <div className="row-flex-center"><strong>A</strong></div>
                            </div>
                            <div className="column col-4">
                                <div className="row-flex-center">
                                    <img className="ukiyoe-responsive" src={require(`./img/justin/${ukiyoeNameSet[1]}.jpg`).default}
                                        alt="ukiyoe art"/>
                                </div>
                                <div className="row-flex-center"><strong>B</strong></div>
                            </div>
                            <div className="column col-4">
                                <div className="row-flex-center">
                                    <img className="ukiyoe-responsive" src={require(`./img/justin/${ukiyoeNameSet[2]}.jpg`).default}
                                        alt="ukiyoe art"/>
                                </div>
                                <div className="row-flex-center"><strong>C</strong></div>
                            </div>
                            {/* <img className="ukiyoe-responsive" src={require(`./img/justin/${ukiyoeName}.jpg`).default} alt="ukiyoe art"/>*/}
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
                                label="Describe the image as concise as possible here (ここで画像をできるだけ簡潔に説明してください)"
                                variant="outlined"
                                onChange={this.handleDescriptionInput}/>
                            <label>Please descibe them in format "<strong>imageID:description</strong>"</label>
                            <label>For example, <strong>A:There is a group of kids playing on a beach</strong></label>
                            <label>このフォーマットで説明してください。 "<strong>画像ID:説明</strong>"</label>
                            <label>例, <strong>A:海で遊んでいる子供たちがいます。</strong></label>
                        </div>
                        <div className="row">
                            { this.state.errorMessage && <div className="error"><strong>{ this.state.errorMessage }</strong></div>}
                        </div>
                        <div className="row">
                            <ColorButton
                                disabled={this.state.isSubmitButtonDisabled}
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    this.handleSubmit()
                                }}>
                                Submit 送信
                            </ColorButton>
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
                    <div className="column col-3">
                        <div id="for_canvas">
                        </div>
                    </div>
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
                    <audio id="error-format">
                        <source src={require(`./audio/${errorFormat}.mp3`).default} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    <audio id="error-imgid">
                        <source src={require(`./audio/${errorImgID}.mp3`).default} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    <audio id="error-multi">
                        <source src={require(`./audio/${errorMulti}.mp3`).default} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    <audio id="error-wait">
                        <source src={require(`./audio/${errorWait}.mp3`).default} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        );
    }
}

export default Live2DHandler;

