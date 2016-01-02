///////////////////////////////////////////////////////////
// TWEET RETRIEVAL                                       //
///////////////////////////////////////////////////////////

{
    Template.test.helpers({
        user: () => Session.get('user'),
        userProfile() {
            if (Session.get('user')) {
                return ReactiveMethod.call('getUserData', Session.get('user'));
            }
        },
        tweets() {
            if (Session.get('user')) {
                log.debug('calling getTweets with user', Session.get('user'));
                return ReactiveMethod.call('getTweets', Session.get('user'), -1, 
                                            Session.get('tweetRetrievalLength'));
            }
        }
    });

    Template.test.events({
        'submit .tweet-retrieval-input': (event, template) => {
            event.preventDefault();

            var screenName = template.$('#tweet-retrieval-screen-name').val();
            Session.set('user', screenName);
            var len = template.$('#tweet-retrieval-length').val();
            Session.set('tweetRetrievalLength', +len);
        }
    });
}

///////////////////////////////////////////////////////////
// MARKOV MODEL DISPLAY                                  //
///////////////////////////////////////////////////////////

{
    Template.test.helpers({
        markovModel() {
            if (Session.get('sourceText')) {
                return ReactiveMethod.call('presentableModelFromText', Session.get('sourceText'));
            }
        },
        markovModelLength() {
            if (Session.get('sourceText')) {
                return _.values(Template.test.__helpers.get('markovModel').call()).length;
            }
        }
    });

    Template.test.events({
        'submit .markov-model-input': (event, template) => {
            event.preventDefault();

            var sourceText = template.$('#markov-input').val();
            Session.set('sourceText', sourceText);
        }
    });
}

///////////////////////////////////////////////////////////
// TWITTER MARKOV MODEL DISPLAY                          //
///////////////////////////////////////////////////////////

{
    Template.test.helpers({
        markovUser: () => Session.get('markovUser'),
        userMarkovModel() {
            if (Session.get('markovUser')) {
                return ReactiveMethod.call('presentableModelFromUser', 
                                           Session.get('markovUser'), 
                                           Session.get('markovUserLength'));
            }
        }
    });

    Template.test.events({
        'submit .twitter-markov-input': (event, template) => {
            event.preventDefault();

            var markovUser = template.$('#markov-screen-name').val();
            Session.set('markovUser', markovUser);
            var markovLength = template.$('#markov-length').val();
            Session.set('markovUserLength', +markovLength);
        }
    });
}

///////////////////////////////////////////////////////////
// MARKOV MODEL GENERATION                               //
///////////////////////////////////////////////////////////

{
    Template.test.helpers({
        markovModelGen() {
            if (Session.get('genSourceText')) {
                return ReactiveMethod.call('generateTextFromSource', 
                                           Session.get('genSourceText'),
                                           Session.get('genSourceTextLen'));
            }
        }
    });

    Template.test.events({
        'submit .markov-gen-input': (event, template) => {
            event.preventDefault();

            var sourceText = template.$('#markov-gen-input').val();
            Session.set('genSourceText', sourceText);
            var len = template.$('#markov-gen-length-input').val();
            Session.set('genSourceTextLen', +len);
        }
    });
}

///////////////////////////////////////////////////////////
// DE-INITIALIZATION                                     //
///////////////////////////////////////////////////////////

Template.test.onDestroyed(() => {
    Session.set('user', undefined);
    Session.set('sourceText', undefined);
    Session.set('markovUser', undefined);
    Session.set('genSourceText', undefined);
});