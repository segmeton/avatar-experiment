import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Live2DHandler from "./Live2DHandler";
import {countDown, secondsToTime} from "./utils/Counter";
import WelcomeCard from "./components/WelcomeCard";
import './App.css';
import EndingAlertDialog from "./components/EndingAlertDialog";
import {db} from "./database/firebase";
import {v4 as uuidv4} from 'uuid';
import ConsentCard from "./components/ConsentCard";

const currentDate = new Date().toLocaleDateString();

const gameStages = ["consent", "welcome", "description", "results"];
const gameStagesDurations = {consent: 0, welcome: 0, description: 70, results: 0}
let currentStateIndex = 0;

class Doc extends React.Component {
    componentDidMount() {
        document.title = `Experiment ${currentDate}`
    }

    render() {
        return null
    }
}

class MainWindow extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            stage: gameStages[0],
            participantName: "",
            participantID: 0,
            totalNumberOfDescriptions: 0,
            totalNumberOfSkipped: 0
        };

        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = countDown.bind(this);

        this.changeState = this.changeState.bind(this);
        this.startDescriptionRound = this.startDescriptionRound.bind(this);
    }

    componentDidMount() {
        let timeLeftVar = secondsToTime(this.state.seconds);
        this.setState({time: timeLeftVar});

        db.ref('descriptions/').orderByChild('imageID').equalTo(1).on("value", function (snapshot) {
            snapshot.forEach(function (data) {
                console.log(data.val().description)
            });
        });
    }

    showEndingAlert = () => {
        this.child.showAfterTimer()

        window.onbeforeunload = null;

        db.ref(`participants/${this.state.participantID}`)
            .update({
                totalNumberOfDescriptions: this.state.totalNumberOfDescriptions,
                totalNumberOfSkipped: this.state.totalNumberOfSkipped,
                finishedSuccessfully: true
            })
            .then(() => {
                console.log("Updated information about current participant to DB")
            });
    }

    changeState = () => {
        if (currentStateIndex === 3) {
            currentStateIndex = 0
        } else {
            currentStateIndex++
        }

        this.timer = 0

        this.setState({
            stage: gameStages[currentStateIndex],
            time: {},
            seconds: gameStagesDurations[gameStages[currentStateIndex]]
        });
    }

    startDescriptionRound = (participantName) => {
        console.log("Name of a participant: " + participantName)

        //https://www.npmjs.com/package/uuid
        const uuid = uuidv4().toString();

        db.ref(`participants/${uuid}`)
            .set({
                participantName,
                participantID: uuid,
                finishedSuccessfully: false
            })
            .then(() => {
                console.log("Added new participant to DB")
            });

        this.setState({
            participantName: participantName,
            participantID: uuid
        });

        this.changeState()
    }

    onSkipButtonClicked = () => {

        console.log("Skip! clicked in child")
        this.setState({
            totalNumberOfSkipped: this.state.totalNumberOfSkipped + 1
        })
    }

    onDescriptionSubmitted = () => {
        this.setState({
            totalNumberOfDescriptions: this.state.totalNumberOfDescriptions + 1
        })
    }

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    CurrentStagePage = () => {
        if (this.state.stage === gameStages[0]) {
            return (<React.StrictMode>
                <Doc/>
                <header className="header">
                    <div className="header-container">
                        <h1 className="title">Important</h1>
                    </div>
                </header>
                <main className="container">
                    <ConsentCard onChildClick={this.changeState.bind(this)}/>
                </main>
                <footer>
                    <div className="footer-container">
                        <span>Ritsumeikan University - Intelligent Computer Entertainment Lab</span>
                    </div>
                </footer>
            </React.StrictMode>)
        } else if (this.state.stage === gameStages[1]) {  //WELCOME STAGE
            return (<React.StrictMode>
                <Doc/>
                <header className="header">
                    <div className="header-container">
                        <h1 className="title">Welcome</h1>
                    </div>
                </header>
                <main className="container">
                    <WelcomeCard onChildClick={this.startDescriptionRound.bind(this)}/>
                </main>
                <footer>
                    <div className="footer-container">
                        <span>Ritsumeikan University - Intelligent Computer Entertainment Lab</span>
                    </div>
                </footer>
            </React.StrictMode>)
        } else if (this.state.stage === gameStages[2]) { //DESCRIPTION STAGE
            this.startTimer()
            return (
                <React.StrictMode>
                    <Doc/>
                    <header className="header">
                        <div className="header-container">
                            {<h1 className="title">Description session: {this.state.time.s}</h1>}
                        </div>
                    </header>
                    {/*style={{ overflowY: 'scroll', height: 'calc(100vh - 127px)' }}*/}
                    <main className="container" >
                        <Live2DHandler
                            participantID={this.state.participantID}
                            onSkipButtonClicked={this.onSkipButtonClicked}
                            onDescriptionSubmitted={this.onDescriptionSubmitted}
                        />
                        <EndingAlertDialog onRef={ref => (this.child = ref)}/>
                    </main>
                    <footer>
                        <div className="footer-container">
                            <span>Ritsumeikan University - Intelligent Computer Entertainment Lab</span>
                        </div>
                    </footer>
                </React.StrictMode>
            )
        }

        return "THE END. THANK YOU"
    }

    render() {
        return (
            this.CurrentStagePage()
        )
    }
}

export default MainWindow

ReactDOM.render(
    <MainWindow/>
    ,
    document.getElementById('root')
);


