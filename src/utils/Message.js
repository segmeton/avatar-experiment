export class Message {
    
    timer = null;
    duration = 0;
    isActive = false;
    
    constructor(duration){
        this.duration = duration;
        this.isActive = false;
        this.timer = null;
    }

    CountDown = (callback) => {
        if(this.isActive){
           this.ClearCountDown();
        }else{
            this.isActive = true;
        }
        
        this.timer = window.setTimeout(function(){
            callback();
            this.isActive = false;
            console.log("timer trigger");
        }, this.duration);

        // this.timer = window.setTimeout(callback, this.duration);
    }

    ClearCountDown = () => {
        clearTimeout(this.timer);
        this.isActive = false;
        this.timer = null;
    }
}

export default Message;