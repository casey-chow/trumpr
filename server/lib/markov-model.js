///////////////////////////////////////////////////////////
// EXTERNAL API: TRAINING                                //
///////////////////////////////////////////////////////////

MarkovModel = this.MarkovModel || {};

MarkovModel.trainFromUser = function(user) {
    var tweets = TwitterAPI.getTweets(user, +1);
    return MarkovModel.trainFromText(processTweets(tweets));
};

// given a text source, train a model
// TODO: enable expanding off a given model
MarkovModel.trainFromText = function(source) {
    var model = {};
    var order = MarkovModel.ORDER;

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

    var model = MarkovModel.trainFromText(source);
    return _.reduce(model, function(out, dist, history) {
        dist = _.reduce(dist, function(out, freq, c) {
            out.push({ freq: freq, letter: c });
            return out;
        }, []);
        out.push({
            history: history.replace(/\s/g, '¤'),
            frequencies: dist
        });
        return out;
    }, []);
};

///////////////////////////////////////////////////////////
// EXTERNAL API: GENERATION                              //
///////////////////////////////////////////////////////////

Meteor.methods(MarkovModel);

///////////////////////////////////////////////////////////
// TWEET PROCESSING                                      //
///////////////////////////////////////////////////////////

// process the tweets to be more suitable for
var processTweets = function(tweets) {
    tweets = _.pluck(tweets, 'text')
    .map(function(tweet) {
        if (tweet.charAt(0) == '"') return '';
        return tweet
        .replace('&amp;', '&')
        .replace('.@', '@')
        .replace(/https?:\/\/t.co\/\w+/, '')
        .replace(/[\s]+/, ' ');
    });

    return tweets.join(MarkovModel.SEPARATOR);
}


///////////////////////////////////////////////////////////
// MODEL TRAINING                                        //
///////////////////////////////////////////////////////////