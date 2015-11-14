Navigation = React.createClass({
    render() {
        return (
            <nav className="navbar navbar-default">
              <div className="container-fluid">
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                  </button>
                  <a className="navbar-brand" href="#">Need More Donald?</a>
                </div>

                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                  <ul className="nav navbar-nav">
                    <li className="active"><a href="#">Donald Trump <span className="sr-only">(current)</span></a></li>
                    <li><a href="#">Carly Fiorina</a></li>
                  </ul>
                  <ul className="nav navbar-nav navbar-right">
                    <li><a href="#">About</a></li>
                  </ul>
                </div>
              </div>
            </nav>
        );
    }
});

Header = React.createClass({
    render() {
        return (
            <div className="jumbotron">
                <h1>Need More Donald?</h1>
                <p>We get it. The Onion has been rehashing the same jokes over and over again, and local news organizations are not keeping up with the Joneses. Where should we best get our lousy humor from?</p>
                <p>Naturally, politics. However the 24-hour news cycle is simply not spouting enough bullshit from the likes of Donald Trump, Ben Carson, Hilary Clinton, and other presdiental wannabes. So we sought to find a better way. A way that would make Donald Trump say, "Keep these computers out of my country!"</p>
                <p>This application automates the spouting of political junk that politicians now no longer need to spend time coming up with and inscribing them into the hearts and minds of the self-referential media circuit we call the 4th branch of government. Because what is democracy if not ever increasingly less human and more computerized?</p>
            </div>
        );
    }
})

// <header className="row">
//     <h1 className="col-md-12">Need More Trump?</h1>
// </header>