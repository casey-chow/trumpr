if (Meteor.isClient) {
    Meteor.startup(function() {
        ReactDOM.render(<App />, document.getElementById("render-target"));
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {

    });
}
