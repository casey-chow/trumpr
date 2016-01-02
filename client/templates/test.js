///////////////////////////////////////////////////////////
// TWEET RETRIEVAL                                       //
///////////////////////////////////////////////////////////

Template.test.onCreated(() => {
    var user = new ReactiveVar();
    var length = new ReactiveVar();
    var tweets = new ReactiveVar();

    Template.test.helpers({
        user: () => user.get(),
        userProfile() {
            if (user.get()) {
                return ReactiveMethod.call('getUserData', user.get());
            }
        },
        tweets() {
            if (user.get()) {
                log.debug('calling getTweets with user', user.get());
                return ReactiveMethod.call('getTweets', user.get(), -1, 
                                            length.get());
            }
        }
    });

    Template.test.events({
        'submit .tweet-retrieval-input': (event, template) => {
            event.preventDefault();

            user.set(template.$('#tweet-retrieval-screen-name').val());
            length.set(+template.$('#tweet-retrieval-length').val());
        }
    });
});

///////////////////////////////////////////////////////////
// MARKOV MODEL DISPLAY                                  //
///////////////////////////////////////////////////////////

Template.test.onCreated(() => {
    var text = new ReactiveVar();

    Template.test.helpers({
        markovModel() {
            if (text.get()) {
                return ReactiveMethod.call('presentableModelFromText', text.get());
            }
        },
        markovModelLength() {
            if (text.get()) {
                return _.values(Template.test.__helpers.get('markovModel').call()).length;
            }
        }
    });

    Template.test.events({
        'submit .markov-model-input': (event, template) => {
            event.preventDefault();

            text.set(template.$('#markov-input').val());
        }
    });
});

///////////////////////////////////////////////////////////
// TWITTER MARKOV MODEL DISPLAY                          //
///////////////////////////////////////////////////////////

Template.test.onCreated(() => {
    var user = new ReactiveVar();
    var length = new ReactiveVar();

    Template.test.helpers({
        markovUser: () => user.get(),
        userMarkovModel() {
            if (user.get()) {
                return ReactiveMethod.call('presentableModelFromUser', 
                                           user.get(), length.get());
            }
        }
    });

    Template.test.events({
        'submit .twitter-markov-input': (event, template) => {
            event.preventDefault();

            user.set(template.$('#markov-screen-name').val());
            length.set(+template.$('#markov-length').val());
        }
    });
});

///////////////////////////////////////////////////////////
// MARKOV MODEL GENERATION                               //
///////////////////////////////////////////////////////////

Template.test.onCreated(() => {
    var text = new ReactiveVar();
    var length = new ReactiveVar();

    Template.test.helpers({
        markovModelGen() {
            if (text.get()) {
                return ReactiveMethod.call('generateTextFromSource', 
                                           text.get(), length.get());
            }
        }
    });

    Template.test.events({
        'submit .markov-gen-input': (event, template) => {
            event.preventDefault();

            text.set(template.$('#markov-gen-input').val());
            length.get(+template.$('#markov-gen-length-input').val());
        }
    });
});