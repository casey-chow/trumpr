const {Router, Route} = ReactRouter;

if (Meteor.isClient) {
    Meteor.startup(function() {
        var routes = (
            <Router>
                <Route path="/" component={App}>
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
