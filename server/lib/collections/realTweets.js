realTweets = this.realTweets || new Mongo.Collection('realTweets');

var Twit = Meteor.npmRequire('twit');
var T = new Twit({
    consumer_key:         'FRkxZ28y55sbr8oScY6qNsVeQ', // API key
    consumer_secret:      'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7', // API secret
    access_token:         '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR', 
    access_token_secret:  'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
});
var tGet = Meteor.wrapAsync(T.get, T);

var oldest = 102046407113732096;

// pull out some tweets newer than the ones we have cached
var pullNewTweets = function(user) {
    if (!user) return;

    var tweets = getTweets(user, youngestTweetId(user), oldest);
    _.each(tweets, function(tweet) {
        realTweets.upsert({ id: tweet.id }, tweet);
    });
};

var getTweets = function(user, youngestId, oldestId) {
    var tweets = tGet('statuses/user_timeline', {
        count: 200,
        include_rts: false,
        lang: 'en',
        screen_name: user,
        max_id: youngestId,
        since_id: oldestId,
        trim_user: true
    });

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


// return the youngest tweet stored for a user
var youngestTweetId = function(user) {
    var tweet = realTweets.findOne({ screen_name: user }, {
        sort: ['id', 'desc'],
        limit: 1
    });

    if (tweet) { 
        return tweet.id; 
    }
};

// // - Hooks

// realTweets.before.find(function (userId, selector, options) {
//     console.log('Searching for tweets by', selector['screen_name']);
//     pullNewTweets(selector['screen_name']);
// });

console.log(getTweets('realDonaldTrump'));
Meteor.methods({
    'getTweets': function(user) {
        console.log('Pulling tweets');
        return getTweets(user);
        // pullNewTweets(user);
        // var tweets = realTweets.find({ screen_name: user }, { sort: ['id', 'desc'] }).fetch();

        // console.log(tweets);
        // return tweets;
    }
})