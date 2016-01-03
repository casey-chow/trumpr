Template.testTweetRetrieval.onCreated(function() {
    this.user = new ReactiveVar();
    this.length = new ReactiveVar();

    this.profile = new ReactiveVar();
    this.tweets = new ReactiveVar();
});

Template.testTweetRetrieval.helpers({
    user:    () => Template.instance().user.get(),
    profile: () => Template.instance().profile.get(),
    tweets:  () => Template.instance().tweets.get()
});

Template.testTweetRetrieval.events({
    'submit .tweet-retrieval-input': (event, tpl) => {
        event.preventDefault();

        tpl.user.set(tpl.$('#screen-name').val());
        tpl.length.set(+tpl.$('#length').val());

        if (tpl.user.get()) {
            Meteor.call('getUserData', tpl.user.get(), (error, result) => {
                if (error) log.error(error);
                tpl.profile.set(result);
            });
            Meteor.call('getTweets', tpl.user.get(), -1, tpl.length.get(), (error, result) => {
                if (error) log.error(error);
                tpl.tweets.set(result);
            });
        } else {
            tpl.tweets.set(undefined);
        }
    }
});