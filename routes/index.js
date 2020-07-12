const express = require('express');
const router = express.Router();
var cors = require('cors');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12353688',
    password: 'xrrP6lqtDA',
    database: 'sql12353688'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});
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
router.get('/dashboard/search-city/', function (req, res) {
    var results = [];
    console.log(req.query);
    connection.query('SELECT * FROM `hospitals` WHERE `City` LIKE + "%' + req.query.q + '%" ORDER BY score DESC', function (err, rows, fields) {
        if (err) console.log(err);
        if (rows && rows.length && rows.length >= 0) {
            console.log(rows);
            for (i = 0; i < rows.length; i++) {
                results.push(rows[i]);
                //console.log(rows[i]);
            }
            
            res.jsonp(results);

        } else {
            res.jsonp(results);
        }

    })
});
router.get('/dashboard/hospital', ensureAuthenticated, function (req, res) {
    res.render('hospital_dashboard')
});
router.get('/dashboard/officer', ensureAuthenticated, function (req, res) {
    res.render('hospital_register', {
        user: req.user
    })
});
router.get('/autocomplete/', function (req, res) {
    //SELECT `Hospital` FROM `hospitals` WHERE `Hospital` LIKE '%a%'
    var results = [];
    var regex = new RegExp(req.query.term, 'i');

    connection.query('SELECT `Hospital`,`State` FROM `hospitals` WHERE `Hospital` LIKE + "%' + req.query.term + '%" OR `City`  LIKE + "%' + req.query.term + '%" ', function (err, rows, fields) {
        if (err) throw err;
        if (rows && rows.length && rows.length > 0) {
            //console.log(rows);
            for (i = 0; i < rows.length; i++) {
                results.push(rows[i]);
            }
            res.jsonp(results);
        }

    })

});
router.get('/search/', function (req, res) {
    var results = [];
    console.log(typeof req.query.q);

    connection.query('SELECT  * FROM `hospitals` WHERE `Hospital` LIKE + "%' + ((req.query.q).split(","))[0] + '%"', function (err, rows, fields) {
        if (err) console.log(err);
        if (rows && rows.length && rows.length > 0) {
            console.log(rows);
            for (i = 0; i < rows.length; i++) {
                results.push(rows[i]);
                console.log(rows[i]);
            }
            res.jsonp(results);

        }

    })
});
router.get('/dashboard/hospital_submit/', ensureAuthenticated, function (req, res) {
   
    const hospital_name = (req.query.hospital_name);
    const beds = (req.query.beds);
    const icus = (req.query.ICU);
    const vent = (req.query.vents);
    var errors = [];

    connection.query('UPDATE `hospitals` SET `Beds`="' + beds + '",`ICU`="' + icus + '",`Ventilators`="' + vent + '" WHERE `Hospital` = "' + hospital_name + '"', function (err, rows) {
        if (err) console.log(err);
        console.log(rows);
    })
    User.findOne({ hospital: hospital_name }).then(user => {
        if (user) {
            errors.push({ msg: 'Hospital already registered' });

            res.render('hospital_dashboard', {
                errors
            })
        } else {
            User.find({ email: req.user.email }, function (err, docs) {
                if (err) console.log(err);
                if (docs.length) {
                    if (docs[0].hospital == "") {
                        //docs[0].hospital = hospital_name
                        var update = User.findByIdAndUpdate(req.user.id, {
                            hospital: hospital_name,
                        });
                        update.exec(function (err, data) {
                            if (err) throw err;

                            res.render('dashboard', {
                                user: req.user
                            })
                        });
                    } else {
                        res.redirect('dashboard');
                    }
                }
            })
        }
    })
    //res.redirect('/dashboard');
});

router.get('/dashboard/officer_submit/', ensureAuthenticated, function (req, res) {
    const name = req.query.officer_name;
    const pass = req.query.pass;
    const errors = [];
    User.findOne({ officer: name }).then(user => {
        if (user) {
            errors.push({ msg: 'Hospital already registered' });

            res.render('hospital_dashboard', {
                errors
            })
        } else {
            User.find({ email: req.user.email }, function (err, docs) {
                if (err) console.log(err);
                if (docs.length) {
                    if (docs[0].officer == "") {
                        //docs[0].hospital = hospital_name
                        var update = User.findByIdAndUpdate(req.user.id, {
                            officer: name,
                            officer_pass: pass
                        });
                        update.exec(function (err, data) {
                            if (err) throw err;

                            res.render('dashboard', {
                                user: req.user
                            })
                        });
                    } else {
                        res.redirect('dashboard');
                    }
                }
            })
        }
    })
});

router.get('/dashboard/hospital_update', ensureAuthenticated, function (req, res) {
    //console.log(req)
    var errors = [];

    const beds = (req.query.beds);
    const icus = (req.query.icu);
    const vents = (req.query.vents);
    var d = new Date();

    //sql query
    connection.query('UPDATE `hospitals` SET `Beds`="' + beds + '",`ICU`="' + icus + '",`Ventilators`="' + vents + '",`LAST_UPDATED`="' + d+'" WHERE `Hospital`="' + req.user.hospital + '"', function (err,rows) {
        if (err) console.log(err);
        if (rows && rows.length && rows.length > 0) {
            res.send({ time: rows[0].LAST_UPDATED });
            res.render('dashboard', {
                user: req.user
            })
        }
        else {
            errors.push({msg: "Could not update, please try again."})
            res.render('dashboard', {
                errors,
                user: req.user
            })
        }

    })
    //if req.user._id matches one in db then append json to progress ;
    
});
router.get('/dashboard/check_authentication/', function (req, res) {
    var t = "Update once",b,i;
    //console.log(req.query.q);
    User.find({ email: req.query.q }, function (err, docs) {
        if (docs.length) {
            if (docs[0].hospital!="") {
                //take time from sql table 
                connection.query('SELECT  * FROM `hospitals` WHERE `Hospital` = "' + docs[0].hospital + '"', function (err, rows) {
                    if (err) console.log(err);
                    if (rows && rows.length && rows.length > 0) {
                        console.log(rows[0]);
                        t = rows[0].LAST_UPDATED;
                        b = rows[0].Beds;
                        i = rows[0].ICU;
                        res.send({ msg: 'Authenticated', time: t, beds: b, ICU: i });
                        
                    }
                })
            } else if (docs[0].officer != "") {
                //take time from sql table 
                     res.send({ msg: 'Authenticated2' });
                     
            }

        
        }
    })

});
//UserDrinks.update({}, { $rename: { "creator" : "user" } }, { multi: true }, callback)
router.post('/dashboard/submit', ensureAuthenticated, function (req, res) {
    var progress;
    const { name, pselect, pdesc, pcheck } = req.body;
    var description = pdesc + "|" + pselect + "|" + pcheck;
    //console.log(req);

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
