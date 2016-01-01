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
const refreshThrottle = 15 * 60 * 1000; // 15 minutes, in milliseconds

///////////////////////////////////////////////////////////
// EXTERNAL API                                          //
///////////////////////////////////////////////////////////

Twitter = class {

    constructor(user) {
        this.profile = twitterUsers.findOne({ screen_name: user });

        if (!this.profile){
            try {
                this.profile = tGet('users/show', { screen_name: user });
                this.profile = _.pick(this.profile, 
                    ['name', 'screen_name', 'profile_image_url']
                );
                twitterUsers.insert(this.profile, forceAsync);
            } catch (err) { log.error(err); return {}; }
        }
    }

    static forUser(user) {
        return new Twitter(user);
    }

    ///////////////////////////////////////////////////////
    // TWEET RETRIEVAL                                   //
    ///////////////////////////////////////////////////////

    // retrieves a user's timeline (or part of it), in the direction specified, 
    // or in reverse chronological by default
    tweets(direction = -1, limit) {
        this.refresh();
        return realTweets.find({ screen_name: this.screenName }, {
            sort: { id: direction },
            limit: parseInt(limit, 10)
        }).fetch();
    }

    ///////////////////////////////////////////////////////
    // GETTERS                                           //
    ///////////////////////////////////////////////////////

    get screenName() {
        return this.profile && this.profile.screen_name;
    }

    ///////////////////////////////////////////////////////
    // TWEET REFRESHING                                  //
    ///////////////////////////////////////////////////////

    // refresh tweets, throttled to only 1 refresh per user per 15 minutes 
    // to ensure we don't hit the API call limit
    refresh() {
        if (!this.throttleOpen()) return;
        log.info('refreshing tweets for @'+this.screenName);

        console.time('tweet refresh');
        var newTweets = pullNewTweets(this.screenName);
        var oldTweets = pullOldTweets(this.screenName);

        var allTweets = newTweets.concat(oldTweets);
        allTweets.forEach(tweet => { 
            tweet.created_at = new Date(tweet.created_at);
            realTweets.upsert({ id: tweet.id }, tweet, forceAsync); 
        });
        console.timeEnd('tweet refresh');
        this.resetThrottle(this.profile);
    }

    // returns true if enough time has passed since last refresh to 
    // warrant refreshing
    throttleOpen() {
        var lastRefreshed = this.profile && this.profile.lastRefreshed;
        var timeDifference = Date.now() - lastRefreshed || Infinity;
        return timeDifference > refreshThrottle;
    }

    resetThrottle() {
        this.profile.lastRefreshed = Date.now();
        twitterUsers.upsert({
            screen_name: this.screenName
        }, { $set: { lastRefreshed: this.profile.lastRefreshed }});
    }

}

///////////////////////////////////////////////////////////
// CLIENT METHOD EXPORT                                  //
///////////////////////////////////////////////////////////

Meteor.methods({
    getTweets(user, direction, limit) {
        return Twitter.forUser(user).tweets(direction, limit);
    },
    getUserData(user) {
        return Twitter.forUser(user).profile;
    }
});

///////////////////////////////////////////////////////////
// TWEET RETRIEVAL                                       //
///////////////////////////////////////////////////////////

// pulls as many tweets as possible from a user given constraints
function pullTweets(user, options) {
    _.defaults(options, {
        count: 200,
        include_rts: false,
        lang: 'en',
        screen_name: user,
        trim_user: true
    });

    try {
        var tweets = tGet('statuses/user_timeline', options);
    } catch (err) { log.error(err); return []; }

    return _.each(tweets, tweet => { tweet.screen_name = user })
    .map(tweet => _.pick(tweet, ['id', 'created_at', 'text', 'screen_name']));
}

function pullNewTweets(user) {
    return pullTweets(user, { since_id: youngestTweetId(user) })
}

function pullOldTweets(user) {
    return pullTweets(user, { max_id: oldestTweetId(user) })
}

///////////////////////////////////////////////////////////
// SUPERLATIVE TWEET IDs                                 //
///////////////////////////////////////////////////////////

// -1 means sort descending, thus, returning greatest
// +1 means sort ascending, thus, returning least
function superlativeTweetId(user, direction) {
    var tweet = realTweets.findOne({ 
        screen_name: user 
    }, { sort: { id: direction } });

    if (tweet) return tweet.id;
};

var youngestTweetId = _.partial(superlativeTweetId, _, -1);
var oldestTweetId   = _.partial(superlativeTweetId, _, +1);