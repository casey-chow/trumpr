App = React.createClass({
    render() {
        return (
            <div className="container">
                <Navigation />
                <Header />
                <main className="row">
                    <Tweets className="col-md-6 col-md-offset-3" author="realDonaldTrump" />
                </main>
            </div>
        );
    }
});