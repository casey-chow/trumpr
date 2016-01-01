Template.tweets.helpers({
    user(screenName) { 
        return ReactiveMethod.call('getUserData', screenName) 
    },
    tweets() { 
        return ReactiveMethod.call('generateMarkovTweets', this.screen_name, 10); 
    },
    date() { return new Date(); }
});

// TODO: turn this into a pubsub thing
