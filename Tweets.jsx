Tweets = React.createClass({

    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
          tweets: TweetsStore.find({ authorHandle: this.props.author }, { sort: { date_created: 1 }}).fetch()
        }
    },

    renderTweets() {
        // Meteor.call('getTweets', 10, this.props.author);
        return this.data.tweets
        .slice(0, this.props.numToShow)
        .reverse()
        .map(function (tweet, key) {
            return (
                <li className="list-group-item" key={key}>
                    <div><div className="image"><img src={tweet.picURL} id="prof"></img></div>
                    <div className="text">
                        <div className="textHead"><b>{tweet.authorFullName} </b>
                            <font color="gray"><small>@{tweet.authorHandle} · {tweet.date}</small></font></div> {tweet.text}
                        </div>
                    </div>
                </li>
            );
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