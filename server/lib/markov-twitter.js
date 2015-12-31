///////////////////////////////////////////////////////////
// CONFIGURATION                                         //
///////////////////////////////////////////////////////////

const separator = '`';
const order = 9;

///////////////////////////////////////////////////////////
// EXTERNAL API                                          //
///////////////////////////////////////////////////////////

MarkovTwitter = {};

// train based off a twitter username
MarkovTwitter.modelFromUser = function(user) {
    return MarkovTwitter.modelFromTweets(TwitterAPI.getTweets(user, +1));
};

MarkovTwitter.presentableModelFromUser = function(user, rows) {
    if (!user) return;
    var source = createSourceText(TwitterAPI.getTweets(user, +1));
    return MarkovModel.fromText(source).presentable().slice(0, rows);
};

// train based off an array of tweets
MarkovTwitter.modelFromTweets = function(tweets) {
    var source = createSourceText(tweets);
    return MarkovModel.fromText(source);
};

// TODO: rewrite as iterator
MarkovTwitter.generateMarkovTweets = function(user, number = 10) {
    if (!user) return [];
    log.info('generating tweets for', user);
    console.time('source creation');
    var source = createSourceText(TwitterAPI.getTweets(user, +1));
    console.timeEnd('source creation');
    var model = MarkovTwitter.modelFromUser(user);

    tweets = [];
    while (tweets.length <= number) {
        let seed       = createSeed(source);
        let markovText = model.generate(seed);
        let nextTweet  = cleanGeneratedTweet(markovText);
        if (nextTweet.length > 15) tweets.push(nextTweet);
    }

    return tweets;
};

Meteor.methods(MarkovTwitter);

///////////////////////////////////////////////////////////
// TWEET PROCESSING                                      //
///////////////////////////////////////////////////////////

// converts a list of tweets into usable source text
var createSourceText = function(tweets) {
    if (!tweets) return '';
    return _.pluck(tweets, 'text')
    .map(tweet => {
        if (tweet.charAt(0) == '"') return '';
        return tweet
        .replace('&amp;', '&')
        .replace('.@', '@')
        .replace(/https?:\/\/t.co\/\w+/g, '')
        .replace(/[\s]+/g, ' ');
    })
    .join(separator)
    .replace(/`+/g, '`');
};

// selects a suitable seed for the tweet to start with
var createSeed = function(source) {
    var randIndex = Math.floor(Math.random() * (source.length - 500));

    // find random suitable end of a "previous" tweet
    var searchSpace = source.slice(randIndex, -500);
    var lastEnd = _(searchSpace).findIndex(c => 
         c == separator || c == '.' || c == '?' || c == '!'
    );

    // find first suitable start for the tweet
    searchSpace = searchSpace.slice(lastEnd, -300);
    var start = _(searchSpace).findIndex((c, i, str) =>
        c.match(/^[a-z@#]$/i)    && 
        str.charAt(i + 1) != '.' && 
        str.charAt(i - 1) != '.'
    );

    return searchSpace.substr(start, order);
};

// truncates tweet to a suitable end, defined as the last separator 
// marker or after the first punctuation mark that succeeds a letter,
// then removes separator characters and collapses repeated spaces
// into single spaces
var cleanGeneratedTweet = function(tweet) {
    if (!tweet) return '';
    var searchSpace = tweet.slice(0, -1);

    var endSep = searchSpace.lastIndexOf(separator);
    var endPunc = _(searchSpace).findIndex((c, i) => {
        if (i < 2) return false;
        var isAlpha = searchSpace[i-2].match(/^[a-z]$/i);
        var precedesNonAlpha = searchSpace[i-1].match(/^[^a-z]$/i);
        return isAlpha && precedesNonAlpha;
    });

    var end = (endSep == -1) ? endPunc : endSep;
    return tweet.slice(0, end)
    .replace(new RegExp(separator, 'g'), ' ')
    .replace(/\s+/g, ' ');
};