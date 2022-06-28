//! importing schema and packages 
const AuthSchema = require('../models/authSchema')
const { genSaltSync, hashSync, compareSync } = require('bcrypt');

exports.getAll = (req, res, next) => {
    AuthSchema.find().then((result) => {
        res.status(200).json({ results: result, success: result.length > 0 ? true : false });
    }).catch(err => {
        res.status(500).json({ error: err, success: false });
    });
}

exports.getById = (req, res, next) => {
    const id = req.params.id;
    AuthSchema.findById(id).then((result) => {
        res.status(200).json(result);
    }).catch(err => {
        res.status(404).json({ error: 'No such user found', success: false });
    });
}

exports.getbyUserId = (req, res, next) => {
    const id = req.params.userId;
    AuthSchema.findById(id).then((result) => {
        res.status(200).json({ "created": result.createdParties });
    }).catch(err => {
        res.status(404).json({ error: 'No such user found', success: false });
    });
}

exports.getByUserJoined = (req, res, next) => {
    const id = req.params.userId;
    AuthSchema.findById(id).then((result) => {
        res.status(200).json({ "joined": result.joinedParties });
    }).catch(err => {
        res.status(404).json({ error: 'No such user found', success: false });
    });
}

//! REGISTER USER 
exports.register = async(req, res, next) => {
    const salt = genSaltSync(10);
    req.body.password = hashSync(req.body.password, salt);

    //! CHECKING IF EMAIL EXISTS OR NOT
    let emailExists = await AuthSchema.findOne({ email: req.body.email });
    if (emailExists === null) {

        //! CHECKING IF PHONE NUMBER EXISTS OR NOT
        let phoneExists = await AuthSchema.findOne({ phoneNumber: req.body.phoneNumber });
        if (phoneExists === null) {

            //! CREATING ACCOUNT 
            const authBody = new AuthSchema(req.body);
            authBody.save().then((result) => {
                res.status(200).json({ message: "Account registered successfully", userId: result._id, success: true });
            }).catch(err => {
                res.status(500).json({ error: err, success: false });
            });

        } else {
            res.status(400).json({ error: "An account is already linked with this number", success: false });
        }

    } else {
        res.status(400).json({ error: "Email already exists", success: false });
    }

}

//! LOGIN USER
exports.login = async(req, res, next) => {

    const { email, password, fcmToken } = req.body;
    let auth = await AuthSchema.findOne({ email: email });

    if (auth !== null) {
        const validPassword = compareSync(password, auth.password);
        if (validPassword) {

            auth.updateOne({ fcmToken: fcmToken }, ).then().then((result) => {
                auth.fcmToken = fcmToken;
                res.status(200).json(auth);
            }).catch(err => {
                res.status(200).json(auth);
                console.log(err)
            })

        } else {
            res.status(404).json({ error: "Invalid email or password", success: false });
        }
    } else {
        res.status(404).json({ error: "Invalid email or password", success: false });
    }

}

exports.updateById = (req, res, next) => {
    const id = req.params.id;

    AuthSchema.findByIdAndUpdate(id, req.body).then((result) => {
        res.status(200).json({ message: "Profile Updated Successfully", success: true });
    }).catch(err => {
        res.status(404).json({ error: err, success: false });
    });

}