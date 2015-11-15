TweetsStore = new Mongo.Collection("Tweets");

if (Meteor.isClient) {
    
    Meteor.startup(function() {
        ReactDOM.render(<App />, document.getElementById("render-target"));
    });
}

if (Meteor.isServer) {
    const exec = Npm.require('child_process').exec;
    const path = Npm.require('path');

    Meteor.methods({
        getTweets(num, authorHandle) {
            // 1st line name, 2nd line screen name, 3rd line profile image url
            console.log('test')
            var execPath = 'python '+path.join(process.env.PWD, 'politicianTweetGenerator.py')+' '+num+' '+authorHandle;
            exec(execPath, Meteor.bindEnvironment(function (error, stdout, stderr) {
                var buf = stdout.toString();
                console.log(stderr);
                var arr = buf.split("\n");
                var authorFullName = arr[0];
                var picURL = arr[2];
                var time = (new Date).toTimeString()
                time = time.substring(0,8) + time.substring(17,24)
                var i = 3;
                arr.slice(3).forEach(function(tweet) {
                    console.log(tweet);
                    TweetsStore.insert({
                        authorFullName: authorFullName,
                        text: tweet, 
                        authorHandle: authorHandle,
                        picURL: picURL
                    });
                });
            }, function () { console.log('Failed to bind environment'); }));
        }
    });

    Meteor.startup(function () {

    });
}