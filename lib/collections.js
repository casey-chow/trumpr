realTweets = this.realTweets || new Mongo.Collection('realTweets');
fakeTweets = this.fakeTweets || new Mongo.Collection('fakeTweets');
twitterUsers = this.twitterUsers || new Mongo.Collection('twitterUsers');
markovModels = this.markovModels || new Mongo.Collection('markovModels');

if (Meteor.isServer) {
    Meteor.publish('realTweets', (screen_name, limit) => 
        realTweets.find({ screen_name }, { limit })
    );
    Meteor.publish('twitterUsers', () => twitterUsers.find({}));
    Meteor.publish('fakeTweets', (screen_name, limit) => 
        fakeTweets.find({ screen_name }, { limit })
    );
    Meteor.publish('markovModels', () => markovModels.find({}));
}