import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {ColorInput} from "../Live2DHandler";
import {FormControlLabel, Radio, RadioGroup} from "@material-ui/core";

const useStyles = makeStyles({
    root: {
        maxWidth: 500,
    },
});

export default function WelcomeCard({onStartDescriptionRoundClick, onGroupSelected}) {
    const classes = useStyles();
    const [isButtonEnabled, setButtonEnabled] = useState(true);
    const [participantName, setParticipantName] = useState("")

    function handleNameInput(event) {
        let receivedName = event.target.value

        setButtonEnabled(!(receivedName.toString().length > 0))
        setParticipantName(receivedName)
    }

    return (
        <Card className={classes.root}>
            <CardMedia
                component="img"
                alt="ritsumeikan_experiment"
                height="140"
                image={process.env.PUBLIC_URL + '/welcome_image.jpg'}
                title="Welcome card"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    Welcome　ようこそ
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    Welcome to the describing stage. Here you will need to create descriptions for displayed images. Enter your username, select your group, and click "Start" to begin!　This username will be used again for the next experiment. <br/> 記述ステージへようこそ。 ここでは、表示される画像の記述を作成する必要があります。 ユーザー名を入力し、グループを選択し、[開始]をクリックして開始します。このユーザー名は、次の実験で再び使用されます。 
                </Typography>
                    <RadioGroup row aria-label="group_number" defaultValue="group_emotions" name="gender1" onChange={onGroupSelected} >
                        <FormControlLabel value="group_emotions" labelPlacement="end" control={<Radio />} label="Group A" />
                        <FormControlLabel value="group_static" labelPlacement="end" control={<Radio />} label="Group B" />
                    </RadioGroup>
                <ColorInput
                    margin="none"
                    fullWidth
                    label="Your username"
                    variant="outlined"
                    onChange={handleNameInput}
                />
            </CardContent>
            <CardActions>
                <Button variant="contained" disabled={isButtonEnabled} size="small" color="secondary"
                        onClick={() => onStartDescriptionRoundClick(participantName)} fullWidth>
                    Start　開始
                </Button>
            </CardActions>
        </Card>
    );
}
