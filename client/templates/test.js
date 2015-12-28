Template.test.helpers({
    user: function() { return Session.get('user'); },
    userProfile: function() {
        return ReactiveMethod.call('getUserData', Session.get('user'));
    },
    tweets: function() { 
        return ReactiveMethod.call('getTweets', Session.get('user'));
    },
    markovModel: function() {
        return ReactiveMethod.call('presentRawMarkovModel', Session.get('sourceText'));
    },
    markovModelLength: function() {
        return Template.test.__helpers.get('markovModel').call().length;
    },
    markovUser: function() { return Session.get('markovUser'); },
    userMarkovModel: function() {
        return ReactiveMethod.call('presentUserMarkovModel', Session.get('markovUser'));
    }
});

Template.test.events({
    'submit .tweet-retrieval-input': function(event, template) {
        event.preventDefault();

        var screenName = template.$('#screen-name').val();
        Session.set('user', screenName);
    },
    'submit .markov-model-input': function(event, template) {
        event.preventDefault();

        var sourceText = template.$('#markov-input').val();
        Session.set('sourceText', sourceText);
    },
    'submit .twitter-markov-input': function(event, template) {
        event.preventDefault();

        var markovUser = template.$('#markov-screen-name').val();
        Session.set('markovUser', markovUser);
    }

});

Template.test.onDestroyed(function() {
    Session.set('user', undefined);
    Session.set('sourceText', undefined);
    Session.set('markovUser', undefined);
});