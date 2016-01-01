///////////////////////////////////////////////////////////
// CONFIGURATION                                         //
///////////////////////////////////////////////////////////

const separator = '`';
const order = 9;

///////////////////////////////////////////////////////////
// EXTERNAL API                                          //
///////////////////////////////////////////////////////////

MarkovTwitter = class MarkovTwitter {

    ///////////////////////////////////////////////////////
    // CONSTRUCTION                                      //
    ///////////////////////////////////////////////////////

    constructor(user) {
        log.info('creating MarkovTwitter for @'+user);
        console.time('instantiate MarkovTwitter');
        this.twitter = Twitter.forUser(user);
        this.model = MarkovModel.fromText(this.source);
        console.timeEnd('instantiate MarkovTwitter');
    }

    static fromUser(user) {
        return new MarkovTwitter(user);
    }

    presentable(rows) {
        return this.model.presentable(rows);
    }

    ///////////////////////////////////////////////////////
    // GETTERS                                           //
    ///////////////////////////////////////////////////////

    get source() {
        return createSourceText(this.twitter.tweets(+1)) || '';
    }

    get screenName() {
        return this.twitter && this.twitter.screenName;
    }

    ///////////////////////////////////////////////////////
    // GENERATION                                        //
    ///////////////////////////////////////////////////////

    retrieve(number = 10, direction = -1, oldest) {
        return fakeTweets.find({ screen_name: this.screenName }, {
            sort: { created_at: direction },
            limit: parseInt(limit, 10)
        }).fetch();
    }

    generate(number = 10) {
        if (!this.twitter) return [];
        log.info('generating tweets for @'+this.screenName);

        var tweets = [];
        var count = 0;
        while (tweets.length <= number && count <= number*2) {
            let seed       = createSeed(this.source);
            let markovText = this.model.generate(200, seed);
            let nextTweet  = cleanGeneratedTweet(markovText);
            if (nextTweet.length > 15) tweets.push(nextTweet);
        }

        tweets = tweets.map(tweet => { return {
            id: MURMUR_HASH.murmur_2(tweet),
            created_at: new Date(),
            screen_name: this.screenName,
            text: tweet 
        }});
        tweets.forEach(tweet => fakeTweets.insert(tweet, forceAsync));
        return tweets;
    };
};

///////////////////////////////////////////////////////////
// METEOR METHODS                                        //
///////////////////////////////////////////////////////////
        
Meteor.methods({
    presentableModelFromUser(user, rows) {
        return MarkovTwitter.fromUser(user).presentable(rows);
    },
    generateMarkovTweets(user, length) {
        return MarkovTwitter.fromUser(user).generate(length);
    }
});

///////////////////////////////////////////////////////////
// TWEET PROCESSING                                      //
///////////////////////////////////////////////////////////

// converts a list of tweets into usable source text
function createSourceText(tweets) {
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
function createSeed(source) {
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
function cleanGeneratedTweet(tweet) {
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