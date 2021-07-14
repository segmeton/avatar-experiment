import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
});

export default function ThankYouCard() {
    const classes = useStyles();

     const onOpenFormButtonClick = () => {
         //TODO: add link to questionnaire
        window.open("https://google.com/","_self")
    }

    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    alt="ritsumeikan_experiment"
                    height="140"
                    image={process.env.PUBLIC_URL + '/thank_you_image.jpg'}
                    title="Welcome card"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        Thank you!
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Thank you for your participation. Now, please share your feedback with us by filling the form.
                    </Typography>
                </CardContent>

            </CardActionArea>
            <CardActions>
                <Button variant="contained" size="small" color="secondary" onClick={onOpenFormButtonClick} fullWidth>
                    Open the form
                </Button>
            </CardActions>
        </Card>
    );
}
