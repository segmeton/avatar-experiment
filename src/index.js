import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Live2DHandler from "./Live2DHandler";
import {countDown, secondsToTime} from "./utils/Counter";
import WelcomeCard from "./components/WelcomeCard";
import './App.css';
import EndingAlertDialog from "./components/EndingAlertDialog";

const currentDate = new Date().toLocaleDateString();

const gameStages = ["welcome", "description", "results"];
const gameStagesDurations = {welcome: 0, description: 36, results: 0}
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

    componentDidMount() {
        let timeLeftVar = secondsToTime(this.state.seconds);
        this.setState({time: timeLeftVar});
    }

    constructor(props) {
        super(props);
        this.state = {
            stage: gameStages[0]
        };

        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = countDown.bind(this);
    }

    showEndingAlert = () => {
        this.child.showAfterTimer()

        window.onbeforeunload = null;
    }

    changeState = () => {
        if (currentStateIndex === 3) {
            currentStateIndex = 0
        } else {
            currentStateIndex++
        }

        this.setState({
            stage: gameStages[currentStateIndex],
            time: {},
            seconds: gameStagesDurations[gameStages[currentStateIndex]]
        });

        this.timer = 0

        this.startTimer()
    }

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    CurrentStagePage = () => {
        if (this.state.stage === gameStages[0]) {  //WELCOME STAGE
            return (<React.StrictMode>
                <Doc/>
                <header className="header">
                    <div className="header-container">
                        <h1 className="title">Welcome</h1>
                    </div>
                </header>
                <main className="container">
                    <WelcomeCard onChildClick={this.changeState}/>
                </main>
                <footer>
                    <div className="footer-container">
                        <span>Ritsumeikan University - Intelligent Computer Entertainment Lab</span>
                    </div>
                </footer>
            </React.StrictMode>)
        } else if (this.state.stage === gameStages[1]) { //DESCRIPTION STAGE
            this.startTimer()
            return (
                <React.StrictMode>
                    <Doc/>
                    <header className="header">
                        <div className="header-container">
                            {<h1 className="title">Description session: {this.state.time.s}</h1>}
                        </div>
                    </header>
                    <main className="container">
                        <Live2DHandler/>
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
    <MainWindow/>,
    document.getElementById('root')
);


