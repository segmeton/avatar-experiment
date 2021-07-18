import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import Button from "@material-ui/core/Button";

export class ShowUsedUsernameAlert extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDialogOpened: false
        };
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    openUsedUsernameDialog() {
        this.handleClickOpen()
    }

    handleClickOpen = () => {
        this.setState(() => ({
            isDialogOpened: true
        }));
    };

    handleClickClose = () => {
        this.setState(() => ({
            isDialogOpened: false
        }));
    }

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.isDialogOpened}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Occupied username</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Sorry, participant with this username already exists. Please, select a different username.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClickClose} color="primary" autoFocus>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default ShowUsedUsernameAlert;
