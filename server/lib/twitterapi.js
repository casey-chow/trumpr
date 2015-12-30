///////////////////////////////////////////////////////////
// DEPENDENCIES                                          //
///////////////////////////////////////////////////////////
var Twit = Meteor.npmRequire('twit');
var T = new Twit({
    consumer_key:        'FRkxZ28y55sbr8oScY6qNsVeQ',
    consumer_secret:     'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7',
    access_token:        '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR', 
    access_token_secret: 'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
});
var tGet = Meteor.wrapAsync(T.get, T);

var lastRefreshed = {};
var refreshThrottle = 15 * 60 * 1000; // 15 minutes, in milliseconds

///////////////////////////////////////////////////////////
// EXTERNAL API                                          //
///////////////////////////////////////////////////////////

TwitterAPI = {};

// retrieves a user's timeline (or part of it), in the
// direction specified, or in reverse chronological
// by default
TwitterAPI.getTweets = function(user, direction, limit) {
    if (!user) return;

    direction = direction || -1;
    return realTweets.find({ 
        screen_name: user
    }, {
        sort: { id: direction },
        limit: parseInt(limit, 10)
    }).fetch();
};

TwitterAPI.getUserData = function(user) {
    var data = twitterUsers.findOne({ screen_name: user })
    if (!data) {
        data = _(tGet('users/show', { screen_name: user }))
               .pick('name', 'screen_name', 'profile_image_url');
        twitterUsers.insert(data);
    }
    return data;
};

// add any new tweets to the database for a given user
TwitterAPI.refreshTweets = function(user) {
    var timeDifference = Date.now() - lastRefreshed[user];
    if (timeDifference < refreshThrottle) return;

    try {
        var newTweets = pullNewTweets(user, youngestTweetId(user));
        var oldTweets = pullOldTweets(user, oldestTweetId(user));
    } catch (err) {
        console.error('Error when refreshing', user, 'Twitter API over capacity.');
        return;
    }
    
    var allTweets = newTweets.concat(oldTweets);
    allTweets.forEach(function(tweet) {
        realTweets.upsert({ id: tweet.id }, tweet);
    });

    lastRefreshed[user] = new Date();
};

Meteor.methods(TwitterAPI);

Meteor.startup(function() {
    realTweets.before.find(function(userId, selector, options) {
        var user = selector.screen_name;
        if (user) TwitterAPI.refreshTweets(user);
    });
});

///////////////////////////////////////////////////////////
// TWEET RETRIEVAL                                       //
///////////////////////////////////////////////////////////

// pulls as many tweets as possible from a user given constraints
// TODO: implement user specific throttling
var pullTweets = function(user, options) {
    _.defaults(options, {
        count: 200,
        include_rts: false,
        lang: 'en',
        screen_name: user,
        trim_user: true
    });

    var tweets = tGet('statuses/user_timeline', options);
    return _.map(tweets, function(tweet) { 
        tweet.screen_name = user;
        return _.pick(tweet, [
            'id', 
            'created_at', 
            'text', 
            'screen_name'
        ]);
    });
};

var pullNewTweets = function(user, sinceId) { 
    return pullTweets(user, { since_id: sinceId }); 
};
var pullOldTweets = function(user, maxId) { 
    return pullTweets(user, { max_id:   maxId   }); 
};

///////////////////////////////////////////////////////////
// SUPERLATIVE TWEET IDs                                 //
///////////////////////////////////////////////////////////

// -1 means sort descending, thus, returning greatest
// +1 means sort ascending, thus, returning least
var superlativeTweetId = function(user, direction) {
    var tweet = realTweets.findOne({ 
        screen_name: user 
    }, {
        sort: { id: direction }
    });

    if (tweet) return tweet.id;
};

var youngestTweetId = _.partial(superlativeTweetId, _, -1);
var oldestTweetId   = _.partial(superlativeTweetId, _, +1);
