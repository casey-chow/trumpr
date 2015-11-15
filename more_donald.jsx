// Define a collection to hold the tweets
TweetDB = new Mongo.Collection("tweetdb");

if (Meteor.isClient) {
    
    Meteor.startup(function() {
        ReactDOM.render(<App />, document.getElementById("render-target"));
    });
}

if (Meteor.isServer) {
    var exec = Npm.require('child_process').exec
    getTweets = function(num, screenName) {
        // 1st line name, 2nd line screen name, 3rd line profile image url
            exec('python ./politicianTweetGenerator.py '+num+' '+ screenName, function (error, stdout, stderr) {
                var buf = stdout.toString();
                var arr = buf.split("\n");
                var name = arr[0];
                var picURL = arr[2];
                var i = 3;
                while (i < arr.length) {
                    TweetDB.insert({
                        name: name,
                        text: arr[i], 
                        screenName: screenName,
                        picURL: picURL
                    });
                }

                // // if you want to write to Mongo in this callback
                // // you need to get yourself a Fiber

                // new Fiber(function() {
                //   ...
                //   fut.return('Python was here');
                // }).run();

            });
        }
    Meteor.startup(function () {
        getTweets(10, 'realDonaldTrump')
    });
}