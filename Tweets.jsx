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
            return <li className="list-group-item clearfix" key={key}> <div><div className="image"><img src={tweet.picURL}></img></div>
               <div className="text"><div className="textHead"><b>{tweet.name}</b> <font color="gray"><small>@{tweet.screenName} · {tweet.date}</small></font></div> {tweet.text}</div></div></li>;
        });
    },

    render() {
        // console.log(this.defaultTweets);
        return (
            <section {...this.props} >
                <header className="page-header">
                    <h1>Tweets <small>@{this.props.params.author}</small></h1>
                </header>
                <ul className="list-group">
                    {this.renderTweets(this.data.tweetdb.reverse())}
                </ul>
            </section>
        );
    }
});