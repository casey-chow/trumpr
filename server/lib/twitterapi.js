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

TwitterAPI = class {
    constructor(user) {
        this.user = user;
    }

    static forUser(user) {
        return new TwitterAPI(user);
    }

    // retrieves a user's timeline (or part of it), in the
    // direction specified, or in reverse chronological
    // by default
    tweets(direction = -1, limit) {
        if (!this.user) return [];

        return realTweets.find({
            screen_name: this.user
        }, {
            sort: { id: direction },
            limit: parseInt(limit, 10)
        }).fetch();
    }

    // refreshes if the user has not been refreshed for `refreshThrottle` time
    refresh() {
        if (!throttlePassed(profile)) return;
        log.info('refreshing tweets for '+this.user);

        var newTweets = pullNewTweets(this.user, youngestTweetId(this.user));
        var oldTweets = pullOldTweets(this.user, oldestTweetId(this.user));

        var allTweets = newTweets.concat(oldTweets);
        allTweets.forEach(tweet => { realTweets.upsert({ id: tweet.id }, tweet); });
        resetThrottle(profile);
    }

    get profile() {
        log.info('getting user data for '+user);

        if (!this.user) return {};
        if (!this._profile)
            this._profile = twitterUsers.findOne({ screen_name: user });

        if (!this._profile){
            try {
                this._profile = tGet('users/show', { screen_name: user });
                this._profile = _.pick(this._profile, 
                    'name', 
                    'screen_name', 
                    'profile_image_url'
                );
                twitterUsers.insert(this._profile);
            } catch (err) { log.error(err); return {}; }
        }

        return this._profile;
    }
}

///////////////////////////////////////////////////////////
// CLIENT METHOD EXPORT                                  //
///////////////////////////////////////////////////////////

Meteor.methods({
    getTweets(user, direction, limit) {
        return TwitterAPI.forUser(user).tweets(direction, limit);
    },
    getUserData(user) {
        return TwitterAPI.forUser(user).profile;
    }
});

///////////////////////////////////////////////////////////
// TWEET REFRESHING                                      //
///////////////////////////////////////////////////////////

// refresh tweets upon retrieval to ensure fresh tweets
// throttled to only 1 refresh per user per 15 minutes to ensure we 
// don't hit the API call limit

// returns true if enough time has passed since last refresh to 
// warrant refreshing
function throttlePassed(profile) {
    var lastRefreshed = profile && profile.lastRefreshed;
    var timeDifference = Date.now() - lastRefreshed;
    return timeDifference > refreshThrottle;
}

function resetThrottle(profile) {
    profile.lastRefreshed = Date.now();
    twitterUsers.upsert({
        screen_name: profile.screen_name
    }, { $set: { lastRefreshed: Date.now() }});
}

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
    } catch (err) {
        console.error(err);
        return [];
    }

    return _(tweets)
    .forEach(tweet => { tweet.screen_name = user })
    .map(tweet => _.pick(tweet, ['id', 'created_at', 'text', 'screen_name']));
}

var pullNewTweets = (user, since_id) => pullTweets(user, { since_id });
var pullOldTweets = (user, max_id  ) => pullTweets(user, { max_id   });

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
