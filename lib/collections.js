realTweets = this.realTweets || new Mongo.Collection('realTweets');
fakeTweets = this.fakeTweets || new Mongo.Collection('fakeTweets');
twitterUsers = this.twitterUsers || new Mongo.Collection('twitterUsers');
markovModels = this.markovModels || new Mongo.Collection('markovModels');