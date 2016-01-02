///////////////////////////////////////////////////////////
// CONFIGURATION                                         //
///////////////////////////////////////////////////////////

const order = 9;

// these mappings are necessary to serialize the markov chains
// MongoDB does not allow periods (.) or dollar signs ($) in
// their field names
const sanitationMap = {
    '.': '\u13AF',
    '$': '\u13B0',
    ' ': '\u13E4'
};

///////////////////////////////////////////////////////////

MarkovModel = class MarkovModel {

    ///////////////////////////////////////////////////////
    // CONSTRUCTION + TRAINING                           //
    ///////////////////////////////////////////////////////

    constructor(sourceText) {
        this.train(sourceText);
    }

    static fromText(sourceText) {
        return new MarkovModel(sourceText);
    }

    // trains (or retrains) a Markov Model based on new source text available
    // modifies the entire object to reflect the new summarized text
    train(newSource) {
        check(newSource, String);

        var text = (this.text || '') + sanitize(newSource);
        var hash = MURMUR_HASH.murmur_2(text);
        var oldModel = this.model;
        log.info('training model, length '+text.length+', hash '+hash);

        this.modelDocument = markovModels.findOne({ hash });
        if (!this.modelDocument) {
            this.modelDocument = {
                model:     trainMarkovModel(newSource, oldModel),
                text:      text,
                hash:      hash,
                createdAt: new Date()
            };
            Meteor.defer(() => markovModels.insert(this.modelDocument));
        }
    }

    ///////////////////////////////////////////////////////
    // GETTERS                                           //
    ///////////////////////////////////////////////////////

    get model()  { 
        return this.modelDocument && this.modelDocument.model;
    }
    
    get text() { 
        return this.modelDocument && this.modelDocument.text;
    }

    get hash()   { 
        return this.modelDocument && this.modelDocument.hash;
    }

    ///////////////////////////////////////////////////////
    // GENERATION                                        //
    ///////////////////////////////////////////////////////

    generate(length, seed) {
        length = length || 200;
        seed = seed || randomSeed(this.text);

        check(length, Match.Integer);
        check(seed,   String);

        var out = seed;
        _.times(length, () => out += this.generateLetter(out));

        return desanitize(out);
    }

    generateLetter(seed) {
        check(seed, String);

        var kgram = seed.slice(-order);
        if (!_.has(this.model, kgram)) return ' ';

        var dist = this.model[kgram];
        var x = Math.random();
        return _.findKey(normalizeDist(dist), val => {
            x -= val;
            return x <= 0;
        });
    }

    ///////////////////////////////////////////////////////
    // PRESENTATION                                      //
    ///////////////////////////////////////////////////////

    presentable(rows) {
        rows = rows || undefined;
        check(rows, Match.Optional(Match.Integer));

        return reduceObject(this.model, (dist, history) => {
            return { 
                history: history,
                frequencies: reduceObject(dist, (freq, letter) => { 
                    return { freq, letter }; 
                })
            };
        }).slice(0, rows);
    }
};

///////////////////////////////////////////////////////////
// METEOR METHODS                                        //
///////////////////////////////////////////////////////////
        
Meteor.methods({
    presentableModelFromText(sourceText) {
        return MarkovModel.fromText(sourceText).presentable();
    },

    generateTextFromSource(sourceText, length) {
        return MarkovModel.fromText(sourceText).generate(length);
    }
});

///////////////////////////////////////////////////////////
// TRAINING HELPERS                                      //
///////////////////////////////////////////////////////////

// given a text source, train a model
// WARNING: modifies the original model, as well as returning the new one 
// if a model is passed in
function trainMarkovModel(source, model) {
    model = model || {};

    source = sanitize(source);
    // append first `order` chars to allow circularity
    source += source.substr(0, order);

    // count frequencies
    _.times(source.length - order, (i) => {
        var history = source.substr(i, order);
        var c = source.charAt(i + order);

        model[history] = model[history] || {};
        model[history][c] = model[history][c] || 0;

        model[history][c] += 1;
    });

    return model;
};

///////////////////////////////////////////////////////////
// GENERATION HELPERS                                    //
///////////////////////////////////////////////////////////

// normalize the frequency table to add up to 1
function normalizeDist(dist) {
    var sum = _.reduce(_.values(dist), _.add);
    return _.mapValues(dist, freq => freq / sum);
}

function randomSeed(source) {
    var start = Math.floor(Math.random() * source.length);
    return source.substr(start, order);
}

///////////////////////////////////////////////////////////
// SERIALIAZATION HELPERS                                //
///////////////////////////////////////////////////////////

// sanitize input for insertion into the database
function sanitize(str) {
    _.each(sanitationMap, (replacement, source) => {
        str = str.replace(new RegExp('\\' + source, 'g'), replacement); 
    });
    return str;
}

// desanitize so there's no weird characters in output text
function desanitize(str) {
    _.each(sanitationMap, (replacement, source) => {
       str = str.replace(new RegExp(replacement, 'g'), source); 
    });
    return str;
}

///////////////////////////////////////////////////////////
// GENERAL HELPERS                                       //
///////////////////////////////////////////////////////////

// a reduce function for helpers, of sorts
function reduceObject(obj, cb) {
    var out = [];
    _.each(obj, (val, key) =>  out.push(cb(val, key)));
    return out;
}
