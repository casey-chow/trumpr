///////////////////////////////////////////////////////////
// EXTERNAL API: CONFIGURATION                           //
///////////////////////////////////////////////////////////

MarkovModel = {};

var separator = '`';
var order = 9;

///////////////////////////////////////////////////////////
// EXTERNAL API: TRAINING                                //
///////////////////////////////////////////////////////////

MarkovModel.modelFromText = function(source) {
    source = sanitizeSourceText(source);
    var model = markovModels.findOne({ sourceText: source });
    if (model) return model;

    model = trainMarkovModel(source);
    markovModels.insert({
        model: model,
        sourceText: source,
        createdAt: new Date()
    });
    return model;
};

MarkovModel.presentableModelFromText = function(source) {
    if (!source) return;

    var model = MarkovModel.modelFromText(source).model;

    var out = [];
    _.each(model, function(dist, history) {
        var _dist = [];
        _.each(dist, function(freq, chr) {
            _dist.push({ freq: freq, letter: chr });
        });

        out.push({
            history: history.replace(/\s/g, '¤'),
            frequencies: _dist
        });
    });
    return out;
};

///////////////////////////////////////////////////////////
// EXTERNAL API: GENERATION                              //
///////////////////////////////////////////////////////////

MarkovModel.generateTextFromSource = function(source, length) {
    if (!source) return;

    var model = MarkovModel.modelFromText(source);
    var seed = randomSeed(source);
    return MarkovModel.generateText(model, seed, length);
};

MarkovModel.generateText = function(model, seed, length) {
    length = parseInt(length) || 200;

    var out = seed;
    _.times(length, function() {
        out += generateLetter(model, out);
    });
    return desanitizeSourceText(out);
};
        
Meteor.methods(MarkovModel);

///////////////////////////////////////////////////////////
// TRAINING HELPERS                                      //
///////////////////////////////////////////////////////////

// given a text source, train a model
// TODO: enable expanding off a given model
var trainMarkovModel = function(source) {
    var model = {};

    // append first `order` chars to allow circularity
    source += source.substr(0, order);

    // count frequencies
    _.times(source.length - order, function(i) {
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

var generateLetter = function(model, history) {
    var kgram = history.slice(-order);
    if (!_.has(model, kgram)) return ' ';

    var dist = model[kgram];
    var x = Math.random();
    return _.findKey(normalizeDist(dist), function(val) {
        x -= val;
        return x <= 0;
    });
};

// normalize the frequency table
var normalizeDist = function(dist) {
    var sum = _.reduce(_.values(dist), _.add);

    return _.mapValues(dist, function(freq) {
       return freq / sum;
    });
};

var randomSeed = function(source) {
    var start = Math.floor(Math.random() * source.length);
    return source.substr(start, order);
};

///////////////////////////////////////////////////////////
// SERIALIAZATION HELPERS                                //
///////////////////////////////////////////////////////////

// these methods are necessary to serialize the markov chains
// MongoDB does not allow periods (.) or dollar signs ($) in
// their field names

var sanitationMap = {
    '.': '\u13AF',
    '$': '\u13B0'
};

var sanitizeSourceText = function(str) {
    _.each(sanitationMap, function(replacement, source) {
        str = str.replace(new RegExp('\\' + source, 'g'), replacement); 
    });
    return str;
};

var desanitizeSourceText = function(str) {
    _.each(sanitationMap, function(replacement, source) {
       str = str.replace(new RegExp(replacement, 'g'), source); 
    });
    return str;
};
