import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {ColorInput} from "../Live2DHandler";

const useStyles = makeStyles({
    root: {
        maxWidth: 500,
    },
});

export default function WelcomeVotingCard({onStartVotingRoundClick}) {
    const classes = useStyles();
    const [isButtonEnabled, setButtonEnabled] = useState(true);
    const [participantCode, setParticipantCode] = useState("")

    function handleCodeInput(event) {
        let receivedCode = event.target.value

        setButtonEnabled(!(receivedCode.toString().length > 0))
        setParticipantCode(receivedCode)
    }

    return (
        <Card className={classes.root}>
            <CardMedia
                component="img"
                alt="ritsumeikan_experiment"
                height="140"
                image={process.env.PUBLIC_URL + '/voting_stage_image.jpg'}
                title="Welcome voting card"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    Welcome　ようこそ
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    Welcome to the voting stage! Here you will vote for the best descriptions for each image. Please, enter your username to get started!<br/>
                    投票ステージへようこそ！ ここでは、各画像の最適な説明に投票します。 開始するには、コードを入力してください。
                </Typography>

                <ColorInput
                    margin="none"
                    fullWidth
                    label="Your username"
                    variant="outlined"
                    onChange={handleCodeInput}
                />
            </CardContent>
            <CardActions>
                <Button variant="contained" disabled={isButtonEnabled} size="small" color="secondary"
                        onClick={() => onStartVotingRoundClick(participantCode)} fullWidth>
                    Start 開始
                </Button>
            </CardActions>
        </Card>
    );
}
