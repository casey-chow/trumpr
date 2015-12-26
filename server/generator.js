MarkovModel = MarkovModel || {};

MarkovModel.SEPARATOR = '|';
MarkovModel.ORDER = 9;

MarkovModel.generateText = function(lm, seed, n) {
    n = n || 200;
    var history = seed;
    return _.reduce(_.range(n), function(out, i) {
        var c = generateLetter(lm, history, MarkovModel.ORDER);
        history += c;
        return out + c;
    }, seed);
}

var generateLetter = function(lm, history) {
    history = history.slice(-order);
    var dist = lm[history];
    x = Math.random();
    return _.findKey(dist, function() {
        x -= v;
        return x <= 0;
    });
}

// given a source block of text, returns an array of length 
// `number` filled with auto tweet goodness
MarkovModel.generateTweets = function(source, number) {
    return _.reduce(_.range(0, number), function(tweets) {
        var seed = createSeed(source);
        var markovText = generateText(lm, MarkovModel.ORDER, seed);
        var nextTweet = truncate(markovText).replace(MarkovModel.SEPARATOR, ' ');
        return tweets.concat(nextTweet);
    }, []);
};

var createSeed = function(source) {
    var randIndex, searchSpace, lastEnd, start;
    var randIndex = Math.floor(Math.random() * (source.length - 500));

    // find random suitable end of a "previous" tweet
    var searchSpace = source.slice(randIndex, -500);
    var lastEnd = _(searchSpace).findIndex(function(c) {
        return c == MarkovModel.SEPARATOR || c == '.' || c == '?' || c == '!';
    });

    // find first suitable start for the tweet
    searchSpace = searchSpace.slice(lastEnd, -300);
    var start = _(searchSpace).findIndex(function(c, i) {
        return c.match(/^[a-z@#]$/i) && searchSpace.charAt(i + 1) != '.';
    });

    return searchSpace.substr(start, MarkovModel.ORDER);
};

// truncates to a suitable end, defined as the last separator marker 
// or after the first punctuation mark that succeeds a letter
var truncate = function(str) {
    var searchSpace = resultTweets.slice(0, -1);

    var endSep = searchSpace.lastIndexOf(MarkovModel.SEPARATOR);
    var endPunc = _(searchSpace).findIndex(function(c, i) {
        if (i <= 1) return false;
        var isAlpha = searchSpace[i-2].match(/^[a-z]$/i);
        var precedesNonAlpha = searchSpace[i-1].match(/^[^a-z]$/i);
        return isAlpha && precedesNonAlpha;
    });

    var end = (endSep == -1) ? endPunc : endSep;
    return str.slice(0, end);
};