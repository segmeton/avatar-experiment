import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import Button from "@material-ui/core/Button";

export class PasswordAlertDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isPasswordDialogOpened: false
        };
    }

    componentDidMount() {
        this.props.onRefPass(this)
    }

    componentWillUnmount() {
        this.props.onRefPass(undefined)
    }

    openPasswordAlertDialog() {
        this.handleClickOpen()
    }

    handleClickOpen = () => {
        this.setState(() => ({
            isPasswordDialogOpened: true
        }));
    };

    handleClickClose = () => {
        this.setState(() => ({
            isPasswordDialogOpened: false
        }));
    }

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.isPasswordDialogOpened}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Wrong code"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Unfortunately, we did not find a participant by this code. Make sure you entered the correct code and try again.<br/>
                            残念ながら、このコードでは参加者が見つかりませんでした。 正しいコードを入力したことを確認して、再入力してください。
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

export default PasswordAlertDialog;
