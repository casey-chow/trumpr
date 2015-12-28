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

    // creates a repeated string of length order+1
    // http://stackoverflow.com/a/1877479/237904
    var pad = Array(order+1).join('~');
    source = pad + source;

    // count frequencies
    _.times(source.length - order, function(i) {
        var history = source.substr(i, order);
        var c = source.charAt(i + order);
        model[history] = model[history] || {};
        model[history][c] = model[history][c] || 0;

        model[history][c] += 1;
    });

    // normalize
    return _.mapValues(model, function(dist) {
        var sum = _.reduce(_.values(dist), function(total, freq) {
            return total + freq;
        });
        return _.mapValues(dist, function(freq) {
           return freq / sum;
        });
    });
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
}
MarkovModel.generateText = function(model, seed, n) {
    n = parseInt(n) || 200;
    var history = seed;
    return _.reduce(_.range(n), function(out) {
        var c = generateLetter(model, history, order);
        history += c;
        return out + c;
    }, seed);
};

Meteor.methods(MarkovModel);


///////////////////////////////////////////////////////////
// GENERATION HELPERS                                    //
///////////////////////////////////////////////////////////

// generates a single letter
var generateLetter = function(model, history) {
    var dist = model[history.slice(-order)];
    if (!dist) return '';
    x = Math.random();
    return _.findKey(dist, function(v) {
        x -= v;
        return x <= 0;
    });
};

var randomSeed = function(source) {
    var start = Math.floor(Math.random() * source.length);
    return source.substr(start, order);
};