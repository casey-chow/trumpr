///////////////////////////////////////////////////////////
// CONFIGURATION                                         //
///////////////////////////////////////////////////////////

const order = 9;

// these mappings are necessary to serialize the markov chains
// MongoDB does not allow periods (.) or dollar signs ($) in
// their field names
const sanitationMap = {
    '.': '\u13AF',
    '$': '\u13B0'
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
        var source = '' + this.source + sanitizeSourceText(newSource);
        var hash = MURMUR_HASH.murmur_2(source);
        var oldModel = this.model;
        log.info('training model, length '+source.length+', hash '+hash);

        this.modelDocument = markovModels.findOne(_.pick(this, 'sourceTextHash'));
        if (!this.modelDocument) {
            this.modelDocument = {
                model:          trainMarkovModel(newSource, oldModel),
                sourceText:     source,
                sourceTextHash: hash,
                createdAt:      new Date()
            };
            console.time('insert document');
            markovModels.insert(this.modelDocument, forceAsync);
            console.timeEnd('insert document');
        }
    }

    ///////////////////////////////////////////////////////
    // GETTERS                                           //
    ///////////////////////////////////////////////////////

    get model()  { 
        return this.modelDocument && this.modelDocument.model;
    }
    get source() { 
        return this.modelDocument && this.modelDocument.sourceText;
    }
    get hash()   { 
        return this.modelDocument && this.modelDocument.sourceTextHash;; 
    }

    ///////////////////////////////////////////////////////
    // GENERATION                                        //
    ///////////////////////////////////////////////////////

    generate(length, seed) {
        length = length || 200;
        seed = seed || randomSeed(this.source);

        var out = seed;
        _.times(length, () => out += this.generateLetter(out));

        return desanitizeSourceText(out);
    }

    generateLetter(seed) {
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
        if (!this.model) return [];
        return reduceObject(this.model, (dist, history) => {
            return { 
                history: history.replace(/\s/g, '¤'),
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
// WARNING: modifies the original model, as well as returning
// the neew one if a model is passed in
// TODO: enable expanding off a given model
function trainMarkovModel(source, model) {
    log.info('training markov model from text length ' + source.length);
    model = model || {};

    source = sanitizeSourceText(source);
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

// normalize the frequency table
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

function sanitizeSourceText(str) {
    _.each(sanitationMap, (replacement, source) => {
        str = str.replace(new RegExp('\\' + source, 'g'), replacement); 
    });
    return str;
}

function desanitizeSourceText(str) {
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
