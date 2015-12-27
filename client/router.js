Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', function () {
    this.render('home');
}, { name: 'home'});

Router.route('/test', function () {
    this.render('test');
}, { name: 'test' });

Router.route('/faq', function () {
    this.render('faq');
}, {
    name: 'faq'
});