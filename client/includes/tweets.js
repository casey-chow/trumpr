Template.tweets.helpers({
    user: screenName => ReactiveMethod.call('getUserData', screenName),
    tweets: function() {
        return ReactiveMethod.call('generateMarkovTweets', this.screen_name, 10);
    },
    date: () => new Date()
});

// TODO: turn this into a pubsub thing
