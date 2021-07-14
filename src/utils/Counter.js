//https://stackoverflow.com/a/54144489/15394878
export function secondsToTime(secs){
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    return {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
}


export function countDown() {
    let seconds = this.state.seconds - 1;
    this.setState({
        time: secondsToTime(seconds),
        seconds: seconds,
    });
    if (seconds === 0) {
        clearInterval(this.timer);
        this.showEndingAlert()
    }
}
