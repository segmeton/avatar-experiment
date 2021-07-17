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
import WelcomeVotingCard from "./components/WelcomeVotingCard";
import {PasswordAlertDialog} from "./components/PasswordAlertDialog";
import ShowPasswordAlertDialog from "./components/ShowPasswordAlertDialog";
import VotingHandler from "./VotingHandler";

const currentDate = new Date().toLocaleDateString();

//CHANGE THIS FOR VOTING
const isVoting = true

// experiment time : description(5min=>5*60)
const gameStages = ["consent", "welcome", "description", "results", "welcome_voting", "voting"];
//TODO: normal time for voting stage
const gameStagesDurations = {consent: 0, welcome: 0, description: 300, results: 0, voting: 10000000}
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
            stage: "consent",
            participantName: "",
            participantID: "0",
            totalNumberOfDescriptions: 0,
            totalNumberOfSkipped: 0,
            language: "English", // English || 日本語
            isAgreeToConsent: false,
            dbEnabled: true,
            selectedGroup: "group_emotions",
            password: "",
            session: "Describing"
        };

        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = countDown.bind(this);

        this.changeState = this.changeState.bind(this);
        this.startDescriptionRound = this.startDescriptionRound.bind(this);
        this.prepareForDescriptionRound = this.prepareForDescriptionRound.bind(this);
    }

    componentDidMount() {
        let timeLeftVar = secondsToTime(this.state.seconds);
        this.setState({time: timeLeftVar});
    }

    showEndingAlert = () => {
        let bgm = document.getElementById("bgm");

        if (bgm !== undefined) {
            bgm.pause();
        }

        this.child.showAfterTimer()

        window.onbeforeunload = null;

        if (this.state.dbEnabled) {
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
    }

    consentAccept = (language) => {
        this.setState({
            language: language,
            isAgreeToConsent: true
        });
        console.log(this.state.language);
        if (isVoting === true) {
            this.changeState(4);
        } else {
            this.changeState(1);
        }
    }

    changeState = (stageIndex) => {
        currentStateIndex = stageIndex

        this.timer = 0

        this.setState({
            stage: gameStages[currentStateIndex],
            time: {},
            seconds: gameStagesDurations[gameStages[currentStateIndex]]
        });
    }

    onGroupSelected = (event) => {
        this.setState({
            selectedGroup: event.target.value
        });

        console.log("Selected group: " + event.target.value)
    }

    startVotingRound = (participantCode) => {
        /*if (this.state.dbEnabled) {
            db.ref('descriptions/').orderByChild('imageID').equalTo(1).on("value", function (snapshot) {
                snapshot.forEach(function (data) {
                    console.log(data.val().description)
                });
            });
        }*/
        if (this.state.dbEnabled) {
            let receivedParticipantID = "0";
            let receivedParticipantName = "_";
            const self = this;
            db.ref('participants/').orderByChild('password').equalTo(participantCode).on("value", function (snapshot) {

                snapshot.forEach(function (data) {
                    receivedParticipantID = data.val().participantID
                    receivedParticipantName = data.val().participantName

                    self.setState({
                        participantName: receivedParticipantName,
                        participantID: receivedParticipantID,
                        password: participantCode
                    });
                });

                if (snapshot.numChildren() > 0 && receivedParticipantID !== "0") {
                    console.log("Participant ID: " + receivedParticipantID + ", name: " + receivedParticipantName)
                    self.changeState(5)
                } else {
                    self.child.openPasswordAlertDialog()
                    console.log("error, wrong password")
                }
            })
        }
    }

    prepareForDescriptionRound = (participantName) => {
        //https://www.npmjs.com/package/uuid
        const uuid = uuidv4().toString();
        const password = uuid.substring(0, 4) + "-" + uuid.substr(uuid.length - 4)

        console.log("Generated password: " + password)

        if (this.state.dbEnabled) {
            this.setState({
                participantName: participantName,
                participantID: uuid,
                password: password
            });

            db.ref(`participants/${uuid}`)
                .set({
                    participantName,
                    participantID: uuid,
                    finishedSuccessfully: false,
                    language: this.state.language,
                    isAgreeToConsent: this.state.isAgreeToConsent,
                    group: this.state.selectedGroup,
                    password: password
                })
                .then(() => {
                    console.log("Added new participant to DB: " + this.state.password)
                    this.child.openShowGeneratedPasswordAlertDialog()
                });
        }
    }

    startDescriptionRound = () => {
        this.changeState(2)
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

    startTimer = () => {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    getStringTime = (time) => {
        let minute = this.state.time.m === undefined ? "00" : this.state.time.m;

        if (time.s === undefined) {
            return `${minute}:00`;
        }

        if (time.s < 10) {
            return `${minute}:0${time.s}`;
        }

        return `${minute}:${time.s}`;
    }

    CurrentStagePage = () => {
        if (this.state.stage === gameStages[0]) { //CONSENT STAGE
            return (<React.StrictMode>
                <Doc/>
                <header className="header">
                    <div className="header-container">
                        <h1 className="title">Important</h1>
                    </div>
                </header>
                <main className="container">
                    <ConsentCard onChildClick={this.consentAccept.bind(this)}/>
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
                    <WelcomeCard
                        onStartDescriptionRoundClick={this.prepareForDescriptionRound.bind(this)}
                        onGroupSelected={this.onGroupSelected.bind(this)}/>
                    <ShowPasswordAlertDialog
                        onRef={ref => (this.child = ref)}
                        password={this.state.password}
                        startDescriptionRound={this.startDescriptionRound.bind(this)}
                    />
                </main>
                <footer>
                    <div className="footer-container">
                        <span>Ritsumeikan University - Intelligent Computer Entertainment Lab</span>
                    </div>
                </footer>
            </React.StrictMode>)
        } else if (this.state.stage === gameStages[2]) { //DESCRIPTION STAGE
            this.startTimer()

            let stringTime = this.getStringTime(this.state.time);

            return (
                <React.StrictMode>
                    <Doc/>
                    <header className="header">
                        <div className="header-container">
                            {<h1 className="title">Describing session: {stringTime}</h1>}
                        </div>
                    </header>
                    {/*style={{ overflowY: 'scroll', height: 'calc(100vh - 127px)' }}*/}
                    <main className="container">
                        <Live2DHandler
                            selectedGroup={this.state.selectedGroup}
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
        } else if (this.state.stage === gameStages[4]) { //WELCOME TO VOTING STAGE
            return (<React.StrictMode>
                <Doc/>
                <header className="header">
                    <div className="header-container">
                        <h1 className="title">Welcome: Voting Stage</h1>
                    </div>
                </header>
                <main className="container">
                    <WelcomeVotingCard
                        onStartVotingRoundClick={this.startVotingRound.bind(this)}/>
                    <PasswordAlertDialog onRefPass={ref => (this.child = ref)}/>
                </main>
                <footer>
                    <div className="footer-container">
                        <span>Ritsumeikan University - Intelligent Computer Entertainment Lab</span>
                    </div>
                </footer>
            </React.StrictMode>)
        } else if (this.state.stage === gameStages[5]) { //VOTING STAGE
            this.startTimer()

            let stringTime = this.getStringTime(this.state.time);

            return (
                <React.StrictMode>
                    <Doc/>
                    <header className="header">
                        <div className="header-container">
                            {<h1 className="title">Voting session: {stringTime}</h1>}
                        </div>
                    </header>
                    <main className="container">
                        <VotingHandler
                            selectedGroup={this.state.selectedGroup}
                            participantID={this.state.participantID}
                            onSkipButtonClicked={this.onSkipButtonClicked}
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


