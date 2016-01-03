Template.tweets.onCreated(function() {
    if (!Session.get('currentUser')) Session.set('currentUser', 'realDonaldTrump');
    this.profile = new ReactiveVar();

    // subscriptions
    this.autorun(() => {
        this.subscribe('fakeTweets', Session.get('currentUser'), 20);
    });

    // profile and tweet data
    this.autorun(() => {
        this.profile.set(twitterUsers.findOne({screen_name: Session.get('currentUser')}));
        Meteor.call('getUserData', Session.get('currentUser'), (error, result) => {
            if (error) log.trace(error);
            this.profile.set(result);
        });

        Meteor.call('asyncGenerateMarkovTweets', Session.get('currentUser'), 20, 2000, forceAsync);
        log.info('updated user to', Session.get('currentUser'));
    });
});

Template.tweets.helpers({
    currentTwitterUser: () => Template.instance().profile.get(),
    tweets() {
        return fakeTweets.find({ screen_name: Session.get('currentUser') }, { 
            sort: { created_at: -1 },
            limit: 20
        }).fetch();
    }
});

// TODO: turn this into a pubsub thing
Template.tweets.events({
    'submit .tweet-gen-input': (event, tpl) => {
        event.preventDefault();
        Session.set('currentUser', tpl.$('#tweet-gen-screen-name').val());
    }
});