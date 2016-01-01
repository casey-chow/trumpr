
const delay = 10 * 1000;

Template.tweets.helpers({
    tweets() {
        return fakeTweets.find({ screen_name: this.screen_name }, { 
            sort: { created_at: -1 },
            limit: 20
        }).fetch();
    }
});

///////////////////////////////////////////////////////////
// CURRENT USER SETTING                                  //
///////////////////////////////////////////////////////////

Template.tweets.helpers({
    currentTwitterUser() { return Session.get('currentTwitterUser'); }
});

Meteor.startup(() => {
    if (!Session.get('currentTwitterUser')) updateUserTo('realDonaldTrump');
});

// TODO: turn this into a pubsub thing
Template.tweets.events({
    'submit .tweet-gen-input': (event, template) => {
        event.preventDefault();
        var screenName = template.$('#tweet-gen-screen-name').val();
        updateUserTo(screenName);

        Meteor.call('generateMarkovTweets', screenName, 10, delay, forceAsync); 
    }
});

function updateUserTo(screenName) {
    Meteor.call('getUserData', screenName, (error, newUser) => {
        if (error) log.error(error);
        Session.set('currentTwitterUser', newUser);
        log.info('updated user to', screenName);
    });
}

// stub method, loads the user directly from MongoDB if it already
// exists until the server gets back
Meteor.methods({
    getUserData(screenName) {
        var newUser = twitterUsers.findOne({ screen_name: screenName });
        Session.set('currentTwitterUser', newUser);
    }
});