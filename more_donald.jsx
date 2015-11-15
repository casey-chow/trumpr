let {Router, Route, IndexRoute} = ReactRouter;

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
    Meteor.startup(function () {

    });
}
