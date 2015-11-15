let {Router, Route, IndexRoute} = ReactRouter;
TweetDB = new Mongo.Collection("tweetdb");

if (Meteor.isClient) {
    
    Meteor.startup(function() {
        let history = ReactRouter.history.useQueries(ReactRouter.history.createHistory)()
        var routes = (
            <Router>
                <Route path="/" component={App}>
                    <IndexRoute component={Header} />
                    <Route path="a/:author" component={Tweets} />
                </Route>
            </Router>
        );
        ReactDOM.render(routes, document.getElementById("render-target"));
    });
}

if (Meteor.isServer) {
    let exec = Npm.require('child_process').exec;
    let path = Npm.require('path');
    getTweets = function(num, screenName) {
        // 1st line name, 2nd line screen name, 3rd line profile image url
            // console.log('test')
            var execPath = 'python '+path.join(process.env.PWD, 'politicianTweetGenerator.py')+' '+num+' '+screenName;
            exec(execPath, Meteor.bindEnvironment(function (error, stdout, stderr) {
                var buf = stdout.toString();
                // console.log(stderr)
                // var buf = stdout
                var arr = buf.split("\n");
                var name = arr[0];
                var picURL = arr[2];
                var i = 3;
                // console.log(arr.length)
                while (i < arr.length) {
                    // console.log(arr[i])
                    TweetDB.insert({
                        name: name,
                        text: arr[i], 
                        screenName: screenName,
                        picURL: picURL
                    }, 0);
                    i++
                    // console.log(i)
                }

                // // if you want to write to Mongo in this callback
                // // you need to get yourself a Fiber

                // new Fiber(function() {
                //   ...
                //   fut.return('Python was here');
                // }).run();

            }, function () { console.log('Failed to bind environment'); }));
        }
    Meteor.startup(function () {
        getTweets(10, 'realDonaldTrump')
        Meteor.setInterval(function() {
        getTweets(1, 'realDonaldTrump')
        }, 15000)
    });
}