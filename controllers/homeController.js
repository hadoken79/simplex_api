const renderHome = (req, res) => {

    res.render('home', {
        title: 'Simplex-Api',
        heading: 'Hier gehts los',
        homeActive: true,
    });
}

module.exports = {
    renderHome
}