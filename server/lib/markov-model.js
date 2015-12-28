///////////////////////////////////////////////////////////
// EXTERNAL API: CONFIGURATION                           //
///////////////////////////////////////////////////////////

MarkovModel = {};

var separator = '`';
var order = 9;

///////////////////////////////////////////////////////////
// EXTERNAL API: TRAINING                                //
///////////////////////////////////////////////////////////

// given a text source, train a model
// TODO: enable expanding off a given model
MarkovModel.trainMarkovModel = function(source) {
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

MarkovModel.presentRawMarkovModel = function(source) {
    if (!source) return;

    var model = MarkovModel.trainMarkovModel(source);
    return _.reduce(model, function(out, dist, history) {
        dist = _.reduce(dist, function(out, freq, c) {
            return out.concat({ freq: freq, letter: c });
        }, []);
        return out.concat({
            history: history.replace(/\s/g, '¤'),
            frequencies: dist
        });
    }, []);
};

///////////////////////////////////////////////////////////
// EXTERNAL API: GENERATION                              //
///////////////////////////////////////////////////////////

MarkovModel.generateTextFromSource = function(source, len) {
    if (!source) return;
    len = parseInt(len) || 100;

    var model = MarkovModel.trainMarkovModel(source);
    var seed = randomSeed(source);
    return MarkovModel.generateText(model, seed, len);
};

MarkovModel.generateText = function(model, seed, n) {
    n = parseInt(n) || 200;
    var out = seed;
    _.times(n, function() {
        out += generateLetter(model, out);
    });
    return out;
};
        
Meteor.methods(MarkovModel);

///////////////////////////////////////////////////////////
// GENERATION HELPERS                                    //
///////////////////////////////////////////////////////////

// generates a single letter
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
    var sum = _.reduce(_.values(dist), function(total, freq) {
        return total + freq;
    });

    return _.mapValues(dist, function(freq) {
       return freq / sum;
    });
};

var randomSeed = function(source) {
    var start = Math.floor(Math.random() * source.length);
    return source.substr(start, order);
};