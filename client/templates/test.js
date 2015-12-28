Template.test.helpers({
    user: function() { return Session.get('user'); },
    userProfile: function() {
        return ReactiveMethod.call('getUserData', Session.get('user'));
    },
    tweets: function() { 
        return ReactiveMethod.call('getTweets', Session.get('user'));
    }
});

Template.test.events({
    'submit .tweet-retrieval': function(event, template) {
        event.preventDefault();

        var screenName = template.$('#screen-name').val();
        Session.set('user', screenName);
    }
});