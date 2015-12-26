Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', function () {
    this.render('home');
}, { name: 'home'});

Router.route('/about', function () {
    this.render('about');
}, {
    name: 'about'
});

Router.route('/faq', function () {
    this.render('faq');
}, {
    name: 'faq'
});