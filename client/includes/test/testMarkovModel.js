Template.testMarkovModel.onCreated(function() {
    this.text = new ReactiveVar();
    this.model = new ReactiveVar();
});

Template.testMarkovModel.helpers({
    markovModel: () => Template.instance().model.get(),
    length:      () => Template.instance().model.get() 
                    && Template.instance().model.get().length,
});

Template.testMarkovModel.events({
    'submit .markov-model-input': (event, tpl) => {
        event.preventDefault();

        tpl.text.set(tpl.$('#markov-input').val());

        if (tpl.text.get()) {
            Meteor.call('presentableModelFromText', tpl.text.get(), (error, result) => {
                if (error) log.error(error);
                tpl.model.set(result);
            });
        } else {
            tpl.model.set(undefined);
        }
    }
});