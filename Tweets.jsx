Tweets = React.createClass({

    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
          tweets: TweetsStore.find({ authorHandle: this.props.author }, { sort: { timestamp: -1, limit: 10 }}).fetch()
        }
    },

    renderTweets() {
        Meteor.call('getTweets', 10, this.props.author);
        return this.data.tweets.map(function (tweet, key) {
            return <li className="list-group-item" key={key}>{tweet.text}</li>;
        });
    },

    render() {
        return (
            <section {...this.props} >
                <header className="page-header">
                    <h1>Tweets <small>@{this.props.author}</small></h1>
                </header>
                <ul className="list-group">
                    {this.renderTweets()}
                </ul>
            </section>
        );
    }
});