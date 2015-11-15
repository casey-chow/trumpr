Tweets = React.createClass({
    
    // This mixin makes the getMeteorData method work
    mixins: [ReactMeteorData],
    
    // Loads items from the TweetDB collection and puts them on this.data.tweetdb
    getMeteorData() {
        return {
            tweetdb: TweetDB.find({}).fetch()
        }
    },
    
    defaultTweets: [
        'Cras justo odio',
        'Dapibus ac facilisis in',
        'Morbi leo risus',
        'Porta ac consectetur ac',
        'Vestibulum at eros'
    ],

    renderTweets(tweets) {
        return tweets.map(function (tweet, key) {
            return <li className="list-group-item" key={key}>{tweet.text}</li>;
        });
    },

    render() {
        console.log(this.defaultTweets);
        return (
            <section {...this.props} >
                <header className="page-header">
                    <h1>Tweets <small>@{this.props.params.author}</small></h1>
                </header>
                <ul className="list-group">
                    {this.renderTweets(this.data.tweetdb)}
                </ul>
            </section>
        );
    }
});