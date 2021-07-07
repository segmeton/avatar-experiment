import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import ImageHandler from './ImageHandler';
import reportWebVitals from './reportWebVitals';

var currentDate = new Date().toLocaleDateString();

class Doc extends React.Component {
    componentDidMount() {
        document.title = `Experiment ${ currentDate }`
    }
    render() { return (null) }
}

ReactDOM.render(
    <React.StrictMode>
        <Doc />
        <header class="header">
            <div class="header-container">
                <h1 class="title">Experiment - { currentDate }</h1>
            </div>
        </header>
        <main class="container">
            <div class="row">
                <div class="column col-6" style={{backgroundColor: "blue"}}>
                    <img src="http://lorempixel.com/400/200/city/5" />
                </div>
                <div class="column col-6" style={{backgroundColor: "red"}}>
                    <img src="http://lorempixel.com/400/200/city/6" />
                </div>
            </div>
        </main>
        <footer>
            <div class="footer-container">
                <span>Ritsumeikan University - Intelligent Computer Entertainment Lab</span>
            </div>
        </footer>
        {/* <ImageHandler />
        <App /> */}
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
