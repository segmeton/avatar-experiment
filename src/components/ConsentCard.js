import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {Checkbox, FormControlLabel, MenuItem, Select} from "@material-ui/core";
import {EmojiProvider, Emoji} from 'react-apple-emojis'
import emojiData from 'react-apple-emojis/lib/data.json'

const useStyles = makeStyles(() => ({
    root: {
        maxWidth: 345,
    },
}));

export default function ConsentCard({onChildClick}) {
    const classes = useStyles();
    const [isButtonEnabled, setButtonEnabled] = useState(true);
    const [isCheckboxChecked, setCheckboxChecked] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState("english")

    const handleCheckboxChange = (event) => {
        setCheckboxChecked(event.target.checked)

        setButtonEnabled(isCheckboxChecked)
    };

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value)
        console.log("Selected language: " + event.target.value)
    }

    return (
        <Card className={classes.root}>

            <CardMedia
                component="img"
                alt="ritsumeikan_experiment"
                height="140"
                image={process.env.PUBLIC_URL + '/consent_image.jpg'}
                title="Welcome card"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    Important information
                </Typography>
                <Typography gutterBottom variant="h5" component="h2">
                    重要な情報
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {
                        //TODO
                    }
                    <EmojiProvider data={emojiData}>
                        <Emoji class="icon-emoji" name="flag-united-kingdom" width={20}/>
                    </EmojiProvider>
                    Some text with warning information
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                    {
                        //TODO
                    }
                    <EmojiProvider data={emojiData}>
                        <Emoji class="icon-emoji" name="flag-japan" width={20}/>
                    </EmojiProvider>
                    警告情報を含むテキスト
                </Typography>
                <Select
                    style={{marginTop: '10px'}}
                    id="language-selector"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    displayEmpty
                    fullWidth
                    onMouseDown={event => event.stopPropagation()}
                >
                    <MenuItem key={0} value="english">English</MenuItem>
                    <MenuItem key={1} value="japanese">日本語</MenuItem>
                </Select>
                <FormControlLabel
                    onMouseDown={event => event.stopPropagation()}
                    control={<Checkbox checked={isCheckboxChecked} onChange={handleCheckboxChange}/>}
                    label="I agree"
                />
            </CardContent>
            <CardActions>
                <Button variant="contained" disabled={isButtonEnabled} size="small" color="secondary"
                        onClick={() => onChildClick()} fullWidth>
                    Continue
                </Button>
            </CardActions>
        </Card>
    );
}
