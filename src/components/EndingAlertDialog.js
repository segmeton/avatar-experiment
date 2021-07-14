import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Slide from '@material-ui/core/Slide';
import ThankYouCard from "./ThankYouCard";
import {lightBlue} from "@material-ui/core/colors";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export class EndingAlertDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isEndingDialogOpen: false
        };
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    showAfterTimer() {
        this.handleClickOpen()
    }

    handleClickOpen = () => {
        this.setState(() => ({
            isEndingDialogOpen: true
        }));
    };

    render() {
        return (
            <div>
                <Dialog fullScreen open={this.state.isEndingDialogOpen} TransitionComponent={Transition}>
                    <header className="header">
                        <div className="header-container">
                            <h1 className="title">Ending</h1>
                        </div>
                    </header>
                    <main className="container">
                        <ThankYouCard />
                    </main>
                </Dialog>
            </div>
        );
    }
}

export default EndingAlertDialog;
