///////////////////////////////////////////////////////////
// CONFIGURATION                                         //
///////////////////////////////////////////////////////////

var separator = '`';

///////////////////////////////////////////////////////////
// EXTERNAL API                                          //
///////////////////////////////////////////////////////////

MarkovTwitter = {};

// train based off a twitter username
MarkovTwitter.trainFromUser = function(user) {
    return MarkovTwitter.trainFromTweets(TwitterAPI.getTweets(user, +1));
};

// train based off an array of tweets
MarkovTwitter.trainFromTweets = function(tweets) {
    return MarkovModel.trainMarkovModel(createSourceText(tweets));
};

MarkovTwitter.generateMarkovTweets = function(user, number) {
    var source = createSourceText(TwitterAPI.getTweets(user, +1));
    var model = MarkovTwitter.trainFromUser(user);
    return generateTweets(source, model, number || 200);
};

MarkovTwitter.presentUserMarkovModel = function(user) {
    if (!user) return;
    var source = createSourceText(TwitterAPI.getTweets(user, +1, 50));
    return MarkovModel.presentRawMarkovModel(source);  
};

Meteor.methods(MarkovTwitter);

///////////////////////////////////////////////////////////
// TWEET PROCESSING                                      //
///////////////////////////////////////////////////////////

// generates `number` tweets from the given source material and 
// Markov Model
// TODO: rewrite as iterator
var generateTweets = function(source, model, number) {
    return _.reduce(_.range(number), function(tweets) {
        var seed = createSeed(source);
        var markovText = MarkovModel.generateText(model, order, seed);
        var nextTweet = truncate(markovText).replace(separator, ' ');
        return tweets.concat(i);
    }, []);
};

// converts a list of tweets into usable source text
var createSourceText = function(tweets) {
    if (!tweets) return '';
    return _.pluck(tweets, 'text')
    .map(function(tweet) {
        if (tweet.charAt(0) == '"') return '';
        return tweet
        .replace('&amp;', '&')
        .replace('.@', '@')
        .replace(/https?:\/\/t.co\/\w+/, '')
        .replace(/[\s]+/, ' ');
    })
    .join(separator);
};

// selects a suitable seed for the tweet to start with
var createSeed = function(source) {
    var randIndex = Math.floor(Math.random() * (source.length - 500));

    // find random suitable end of a "previous" tweet
    var searchSpace = source.slice(randIndex, -500);
    var lastEnd = _(searchSpace).findIndex(function(c) {
        return c == separator || c == '.' || c == '?' || c == '!';
    });

    // find first suitable start for the tweet
    searchSpace = searchSpace.slice(lastEnd, -300);
    var start = _(searchSpace).findIndex(function(c, i) {
        return c.match(/^[a-z@#]$/i) && searchSpace.charAt(i + 1) != '.';
    });

    return searchSpace.substr(start, order);
};

// truncates tweet to a suitable end, defined as the last separator 
// marker or after the first punctuation mark that succeeds a letter
var truncate = function(str) {
    var searchSpace = resultTweets.slice(0, -1);

    var endSep = searchSpace.lastIndexOf(separator);
    var endPunc = _(searchSpace).findIndex(function(c, i) {
        if (i <= 1) return false;
        var isAlpha = searchSpace[i-2].match(/^[a-z]$/i);
        var precedesNonAlpha = searchSpace[i-1].match(/^[^a-z]$/i);
        return isAlpha && precedesNonAlpha;
    });

    var end = (endSep == -1) ? endPunc : endSep;
    return str.slice(0, end);
};