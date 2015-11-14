App = React.createClass({
    render() {
        return (
            <div className="container">
                <header className="row">
                    <h1 className="col-md-12">Need More Trump?</h1>
                </header>
                <main className="row">
                    <section className="col-md-4">
                        <Tweets author="realDonaldTrump" />
                    </section>
                </main>
            </div>
        );
    }
});