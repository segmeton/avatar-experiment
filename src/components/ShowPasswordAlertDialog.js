import React, {Component} from 'react';
import Dialog from '@material-ui/core/Dialog';
import {DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import Button from "@material-ui/core/Button";

export class ShowPasswordAlertDialog extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isPasswordDialogOpened: false
        };
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    openShowGeneratedPasswordAlertDialog() {
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

        this.props.startDescriptionRound()
    }

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.isPasswordDialogOpened}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Save your password!"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            This is your password: <b>{this.props.password}</b> Please, save it - you will use it tomorrow during a voting stage.<br/>
                            これはあなたのパスワードです：<b> {this.props.password} </ b> 保存してください-明日の投票ステージで使用します。
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClickClose} color="primary" autoFocus>
                            Continue　次へ
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default ShowPasswordAlertDialog;
