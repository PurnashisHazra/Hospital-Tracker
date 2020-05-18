const express = require('express');
const router = express.Router();
var cors = require('cors');

router.use(cors());
const User = require('../models/User');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
// Dashboard
router.get('/dashboard', ensureAuthenticated, function (req, res) {
    var msg;
    if (req.user.progress == 0) {
        msg = undefined;
    }
    else {
        msg = req.user.progress;
    }
    res.render('dashboard', {
        msg: msg,
        user: req.user
    })
});
//UserDrinks.update({}, { $rename: { "creator" : "user" } }, { multi: true }, callback)
router.post('/dashboard/submit', ensureAuthenticated, function (req, res) {
    var progress;
    const { name, pselect, pdesc, pcheck } = req.body;
    var description = pdesc + "|" + pselect + "|" + pcheck;
    console.log(req);

    //if req.user._id matches one in db then append json to progress ;
    var update = User.findByIdAndUpdate(req.user.id, {
        progress:1,
        problem : description
    });
    update.exec(function (err, data) {
        if (err) throw err;
        progress = data.progress;
        res.render('dashboard', {
            user: req.user,
            msg: progress 
        })
    });
});
router.post('/dashboard/docsubmit', ensureAuthenticated, function (req, res) {
    var progress;
    const { name, reg_no, council, qualification, rectify_data, doccheck } = req.body;
    var description = name + "|" + reg_no + "|" + council + "|" + qualification + "|" + rectify_data + "|" + doccheck;

    //if req.user._id matches one in db then append json to progress ;
    var update = User.findByIdAndUpdate(req.user.id, {
        progress: 1,
        problem: description
    });
    update.exec(function (err, data) {
        if (err) throw err;
        progress = data.progress;
        res.render('dashboard', {
            user: req.user,
            msg: progress
        })
    });
});
router.post('/dashboard/staffsubmit', ensureAuthenticated, function (req, res) {
    var progress;
    const { name, verify, pdesc, scheck } = req.body;
    var description = name + "|" + verify + "|" + pdesc + "|" + scheck;

    //if req.user._id matches one in db then append json to progress ;
    var update = User.findByIdAndUpdate(req.user.id, {
        progress: 1,
        problem: description
    });
    update.exec(function (err, data) {
        if (err) throw err;
        progress = data.progress;
        res.render('dashboard', {
            user: req.user,
            msg: progress
        })
    });
});
router.post('/dashboard/othersubmit', ensureAuthenticated, function (req, res) {
    var progress;
    const { name, occ, opdesc, opcheck } = req.body;
    var description = name + "|" + occ + "|" + opdesc + "|" + opcheck;

    //if req.user._id matches one in db then append json to progress ;
    var update = User.findByIdAndUpdate(req.user.id, {
        progress: 1,
        problem: description
    });
    update.exec(function (err, data) {
        if (err) throw err;
        progress = data.progress;
        res.render('dashboard', {
            user: req.user,
            msg: progress
        })
    });
});

module.exports = router;
