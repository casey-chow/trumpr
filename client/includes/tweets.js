Template.tweets.helpers({
    user: function(user) {
        return ReactiveMethod.call('getUserData', user);
    },
    tweets: function(user) {
        return ReactiveMethod.call('generateMarkovTweets', this.screen_name, 10);
    },
    date: function() {
        return new Date();
    }
});

// TODO: turn this into a pubsub thing
