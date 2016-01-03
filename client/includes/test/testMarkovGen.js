Template.testMarkovGen.onCreated(function() {
    this.sourceText = new ReactiveVar();
    this.length = new ReactiveVar();
    this.outputText = new ReactiveVar();
});

Template.testMarkovGen.helpers({
    generated_text: () => Template.instance().outputText.get()
});

Template.testMarkovGen.events({
    'submit .markov-gen-input': (event, tpl) => {
        event.preventDefault();

        tpl.sourceText.set(tpl.$('#source-text-input').val());
        tpl.length.set(+tpl.$('#length-input').val());

        if (tpl.sourceText.get()) {
            Meteor.call('generateTextFromSource', tpl.sourceText.get(), 
                        tpl.length.get(), (error, result) => {
                if (error) log.error(error);
                tpl.outputText.set(result);
            });
        }
    }
});
