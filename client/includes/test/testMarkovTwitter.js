Template.testMarkovTwitter.onCreated(function() {
    this.user = new ReactiveVar();
    this.length = new ReactiveVar();
    this.model = new ReactiveVar();
});

Template.testMarkovTwitter.helpers({
    user:  () => Template.instance().user.get(),
    model: () => Template.instance().model.get()
});

Template.testMarkovTwitter.events({
    'submit .twitter-markov-input': (event, tpl) => {
        event.preventDefault();

        tpl.user.set(tpl.$('#markov-screen-name').val());
        tpl.length.set(+tpl.$('#markov-length').val());

        if (tpl.user.get()) {
            Meteor.call('presentableModelFromUser', tpl.user.get(), 
                        tpl.length.get(), (error, result) => {
                if (error) log.error(error);
                tpl.model.set(result);
            });
        } else {
            tpl.model.set(undefined);
        }
    }
});

