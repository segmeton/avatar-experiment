import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import ImageHandler from './ImageHandler';
import reportWebVitals from './reportWebVitals';
import Live2DHandler from "./Live2DHandler";

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
        <header className="header">
            <div className="header-container">
                <h1 className="title">Experiment - { currentDate }</h1>
            </div>
        </header>
        <main className="container">
            <Live2DHandler />
        </main>
        <footer>
            <div className="footer-container">
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
