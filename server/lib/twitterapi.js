///////////////////////////////////////////////////////////
// DEPENDENCIES                                          //
///////////////////////////////////////////////////////////
const Twit = Meteor.npmRequire('twit');
const T = new Twit({
    consumer_key:        'FRkxZ28y55sbr8oScY6qNsVeQ',
    consumer_secret:     'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7',
    access_token:        '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR', 
    access_token_secret: 'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
});
const tGet = Meteor.wrapAsync(T.get, T);


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
    log.info('getting user data for '+user);
    if (!user) return;

    var data = twitterUsers.findOne({ screen_name: user });
    if (data) return data;

    try {
        data = tGet('users/show', { screen_name: user });
    } catch (err) {
        console.error(err);
        return {};
    }

    data = _.pick(data, 'name', 'screen_name', 'profile_image_url');
    twitterUsers.insert(data);
    return data;
};

// add any new tweets to the database for a given user
TwitterAPI.refreshTweets = function(user) {
    log.info('refreshing tweets for '+user);
    var newTweets = pullNewTweets(user, youngestTweetId(user));
    var oldTweets = pullOldTweets(user, oldestTweetId(user));

    var allTweets = newTweets.concat(oldTweets);
    allTweets.forEach(tweet => { realTweets.upsert({ id: tweet.id }, tweet); });
};

///////////////////////////////////////////////////////////
// CLIENT METHOD EXPORT                                  //
///////////////////////////////////////////////////////////

Meteor.methods(_.pick(TwitterAPI, [
    'getTweets', 
    'getUserData'
]));

///////////////////////////////////////////////////////////
// TWEET REFRESHING                                      //
///////////////////////////////////////////////////////////

var lastRefreshed = {};
var refreshThrottle = 15 * 60 * 1000; // 15 minutes, in milliseconds

// refresh tweets upon retrieval to ensure fresh tweets
// throttled to only 1 refresh per user per 15 minutes to ensure we 
// don't hit the API call limit
Meteor.startup(() => {
    realTweets.before.find((userId, selector, options) => {
        var user = selector.screen_name;
        if (!user) return;

        var timeDifference = Date.now() - lastRefreshed[user];
        TwitterAPI.refreshTweets(user);
        lastRefreshed[user] = Date.now();
    });
});

///////////////////////////////////////////////////////////
// TWEET RETRIEVAL                                       //
///////////////////////////////////////////////////////////

// pulls as many tweets as possible from a user given constraints
var pullTweets = function(user, options) {
    _.defaults(options, {
        count: 200,
        include_rts: false,
        lang: 'en',
        screen_name: user,
        trim_user: true
    });

    try {
        var tweets = tGet('statuses/user_timeline', options);
    } catch (err) {
        console.error(err);
        return [];
    }

    return _(tweets)
    .forEach(tweet => { tweet.screen_name = user })
    .map(tweet => _.pick(tweet, ['id', 'created_at', 'text', 'screen_name']));
};

var pullNewTweets = (user, since_id) => pullTweets(user, { since_id });
var pullOldTweets = (user, max_id  ) => pullTweets(user, { max_id   });

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
