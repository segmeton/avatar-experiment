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
        maxWidth: 345,
    },
});

export default function WelcomeCard({onChildClick}) {
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
                    Welcome
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    Enter your name and click "Start" to begin!
                </Typography>
                <ColorInput
                    margin="none"
                    fullWidth
                    label="Your name"
                    variant="outlined"
                    onChange={handleNameInput}
                />
            </CardContent>
            <CardActions>
                <Button variant="contained" disabled={isButtonEnabled} size="small" color="secondary"
                        onClick={() => onChildClick(participantName)} fullWidth>
                    Start
                </Button>
            </CardActions>
        </Card>
    );
}
