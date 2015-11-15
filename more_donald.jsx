let {Router, Route, IndexRoute} = ReactRouter;
let Console = new Mongo.Collection('console');

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

	var exec = Npm.require('child_process').exec;
	var Fiber = Npm.require('fibers');
	var Future = Npm.require('fibers/future');
	var tweets = [];
	
    Meteor.methods({

 	 callPython: function() {
    	var fut = new Future();
    	
    	exec('python ./politicianTweetGenerator.py 10 realDonaldTrump', function (error, stdout, stderr) {
    		stdout.on('readable', function() {
    			tweets[tweets.length-1] = stdout.read();
    		})

	      // // if you want to write to Mongo in this callback
	      // // you need to get yourself a Fiber

	      // new Fiber(function() {
	      //   ...
	      //   fut.return('Python was here');
	      // }).run();

	    });
	    return fut.wait();
	  },

	});
}

if (Meteor.isServer) {
    Meteor.startup(function () {

    });
}
