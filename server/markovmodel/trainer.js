MarkovModel = this.MarkovModel || {};

MarkovModel.trainUser = function(user) {
    var tweets = MarkovModel.getUserTweets(user);
    return trainFromText(tweets.join(MarkovModel.SEPARATOR));
};

var createTwit = function() {
    MarkovModel.Twit = MarkovModel.Twit || Meteor.npmRequire('twit');
    MarkovModel.T = MarkovModel.T || new MarkovModel.Twit({
        consumer_key:         'FRkxZ28y55sbr8oScY6qNsVeQ', // API key
        consumer_secret:      'NmGUxz5NJAIT3lx4X4T5G0cLkr7MwYgoHkuZ52Np3vYZNz51m7', // API secret
        access_token:         '3843303509-g3iFsHNxjVUfWml1wkPwwrvAuxzLhV5BZezLFzR', 
        access_token_secret:  'iCh01KDauwYMj4mYfqOIIvWQFafNRGJz6AhXC9zM9daA5'
    });
    MarkovModel.twGet = Meteor.wrapAsync(MarkovModel.T.get, MarkovModel.T);
}

MarkovModel.getUserTweets = function(user) {
    createTwit();
    var youngestId = '1992046407113732096'; // this continually decreases
    var oldestId =    '102046407113732096'; // this remains the same

    return _(_.range(MarkovModel.NUM_QUERIES))
    .map(function() {
        var data = MarkovModel.twGet('statuses/user_timeline', {
            count: 200,
            include_rts: false,
            lang: 'en',
            screen_name: user,
            max_id: youngestId, 
            since_id: oldestId,
            trim_user: true
        });

        youngestId = _.min(_.pluck(data, id)) - 1;
        return data;
    })
    .flatten()
    .pluck('text')
    .map(function(tweet) {
        if (tweet.charAt(0) == '"') return '';
        return tweet
        .replace('&amp;', '&')
        .replace('.@', '@')
        .replace(/https?:\/\/t.co\/\w+/, '')
        .replace(/[\s]+/, ' ');
    })
    .value();
};

MarkovModel.getUserData = function(user) {
    createTwit();
    var data = MarkovModel.twGet('users/show', { screen_name: user });
    return _.pick(data, 'name', 'screen_name', 'profile_image_url');
};

MarkovModel.trainFromText = function(source) {
    var model = {};
    // http://stackoverflow.com/a/1877479/237904
    var pad = Array(MarkovModel.ORDER+1).join('~');
    source = pad + source;

    // count frequencies
    _.each(_.range(0, source.length - MarkovModel.ORDER), function(i) {
        var history = source.substr(i, MarkovModel.ORDER);
        var c = source.charAt(i + MarkovModel.ORDER);

        model[history] = model[history] || {};
        model[history][c] = model[history][c] || 0;

        model[history][c] += 1;
    });

    // normalize
    return _.map(model, function(dist, history) {
        var sum = _.reduce(_.values(dist), function(sum, freq) { 
            return sum + freq; 
        });
        return _.map(dist, function(c, freq) {
           return freq / sum;
        });
    });
};