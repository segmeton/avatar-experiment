import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

//CHANGE THIS FOR VOTING
const isVoting = false;

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
});

export default function ThankYouCard() {
    const classes = useStyles();

    const onOpenFormButtonClick = () => {
        let url = "";
        if(isVoting){
            url = "https://www.surveymonkey.com/r/C3KQSMR"
        }else{
            url = "https://www.surveymonkey.com/r/VLQ6MGF"
        }
        window.open(url,"_self")
    }

    return (
        <Card className={classes.root}>
                <CardMedia
                    component="img"
                    alt="ritsumeikan_experiment"
                    height="140"
                    image={process.env.PUBLIC_URL + '/thank_you_image.jpg'}
                    title="Welcome card"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        Thank you!　ありがとうございます！
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Thank you for your participation. Now, please share your feedback with us by filling the questionnaire.<br/>
                        ご参加ありがとうございます。 調査票に記入して、フィードバックをお寄せください。 
                    </Typography>
                </CardContent>
            <CardActions>
                <Button variant="contained" size="small" color="secondary" onClick={onOpenFormButtonClick} fullWidth>
                    Go to questionnaire page 調査票のページへ
                </Button>
            </CardActions>
        </Card>
    );
}
