Router.configure({ layoutTemplate: 'layout'});

Router.route('/', { 
    name: 'home',
    waitOn: () => {
        return [ 
            Meteor.subscribe('twitterUsers'),
            Meteor.subscribe('fakeTweets', 'realDonaldTrump', 20)
        ];
    },
    fastRender: true,
    loadingTemplate: 'loading'
});

Router.route('/test', { name: 'test' });
