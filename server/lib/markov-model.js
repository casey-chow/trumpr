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

MarkovModel = class {

    ///////////////////////////////////////////////////////
    // CONSTRUCTION + TRAINING                           //
    ///////////////////////////////////////////////////////

    constructor(sourceText) {
        this.sourceText = sanitizeSourceText(sourceText);
        this.sourceTextHash = MURMUR_HASH.murmur_2(this.sourceText);

        this.modelDocument = markovModels.findOne(_.pick(this, 'sourceTextHash'));

        if (!this.modelDocument) {
            this.modelDocument = {
                model:          trainMarkovModel(this.sourceText),
                sourceText:     this.sourceText,
                sourceTextHash: this.sourceTextHash,
                createdAt:      new Date()
            };
            markovModels.insert(this.modelDocument, forceAsync);
        }

        this.model = this.modelDocument.model;
    }

    static fromText(sourceText) {
        return new MarkovModel(sourceText);
    }

    ///////////////////////////////////////////////////////
    // GENERATION                                        //
    ///////////////////////////////////////////////////////

    generate(seed, length) {
        length = length || 200;
        seed = seed || '';
        log.info('generating text length ' + length);

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
        return reduceObject(model, (dist, history) => {
            return {
                history: history.replace(/\s/g, '¤'),
                frequencies: reduceObject(dist, 
                    (freq, letter) => { freq, letter }
                )
            };
        }).slice(0, rows);
    }

    testGenerate(length) {
        return this.generate(randomSeed(this.sourceText), length)
    }
};

///////////////////////////////////////////////////////////
// METEOR METHODS                                        //
///////////////////////////////////////////////////////////
        
Meteor.methods({
    presentableModelFromText(sourceText) {
        return MarkovModel.fromText(sourceText).presentable()
    },

    generateTextFromSource(sourceText, length) {
        var seed = randomSeed(sourceText);
        return MarkovModel.fromText(sourceText).generate(seed, length);
    }
});

///////////////////////////////////////////////////////////
// TRAINING HELPERS                                      //
///////////////////////////////////////////////////////////

// given a text source, train a model
// TODO: enable expanding off a given model
var trainMarkovModel = function(source) {
    log.info('training markov model from text length ' + source.length);
    var model = {};

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
