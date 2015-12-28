Template.test.helpers({
    user: function() { return Session.get('user'); },
    userProfile: function() {
        return ReactiveMethod.call('getUserData', Session.get('user'));
    },
    tweets: function() { 
        return ReactiveMethod.call('getTweets', Session.get('user'), -1,Session.get('tweetRetrievalLength'));
    },
    markovModel: function() {
        return ReactiveMethod.call('presentRawMarkovModel', Session.get('sourceText'));
    },
    markovModelLength: function() {
        return _.values(Template.test.__helpers.get('markovModel').call()).length;
    },
    markovUser: function() { return Session.get('markovUser'); },
    userMarkovModel: function() {
        return ReactiveMethod.call('presentUserMarkovModel', Session.get('markovUser'), Session.get('markovUserLength'));
    },
    markovModelGen: function() {
        return ReactiveMethod.call('generateTextFromSource', Session.get('genSourceText'), Session.get('genSourceTextLen'));
    }
});

Template.test.events({
    'submit .tweet-retrieval-input': function(event, template) {
        event.preventDefault();

        var screenName = template.$('#tweet-retrieval-screen-name').val();
        Session.set('user', screenName);
        var len = template.$('#tweet-retrieval-length').val();
        Session.set('tweetRetrievalLength', len || 30);
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
        var markovLength = template.$('#markov-length').val();
        Session.set('markovUserLength', markovLength);
    },
    'submit .markov-gen-input': function(event, template) {
        event.preventDefault();

        var sourceText = template.$('#markov-gen-input').val();
        Session.set('genSourceText', sourceText);
        var len = template.$('#markov-gen-length-input').val();
        Session.set('genSourceTextLen', len || 100);
    },
});

Template.test.onDestroyed(function() {
    Session.set('user', undefined);
    Session.set('sourceText', undefined);
    Session.set('markovUser', undefined);
    Session.set('genSourceText', undefined);
});