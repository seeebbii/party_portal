const express = require('express')
const router = express.Router()
const { PartySchemas } = require('../models/partyschema')
const AuthSchema = require('../models/authSchema')
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images')
    }
    , filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
}
);
const upload = multer({
    storage: storage
});

router.get('/', (req, res) => {
    res.send("Welcome to party end point")
})

router.get('/all', (req, res, next) => {
    PartySchemas.find().then((result) => {

        //     var newArray = result.filter((item) => {
        //     const diffTime = Math.abs(item.endingDate - Date.now())
        //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        //     console.log(diffDays)
        //     return diffDays == 1
        // })


        res.status(200).json({ results: result, success: result.length > 0 ? true : false });
    }).catch(err => {
        res.status(500).json({ error: err, success: false });
    });
});
router.get('/all/:id', (req, res, next) => {
    const id = req.params.id;
    PartySchemas.findById(id).then((result) => {
        res.status(200).json({ result: result, success: true });
    }).catch(err => {
        res.status(404).json({ error: 'No data', success: false });
    });
});

router.post('/delete/:partyId', (req, res, next) => {

    const partyId = req.params.partyId;

    PartySchemas.deleteOne({ "_id": partyId }).then((result) => {
        res.status(200).json({ message: "Party deleted", partyId: result._id, success: true });
    }).catch(err => {
        res.status(500).json({ error: err, success: false });
    });
});

router.post('/create',  async (req, res, next) => {
    
    const partyBody = new PartySchemas(req.body)
    partyBody.save(req.body).then((partyCreated) => {
        AuthSchema.findOne({ "_id": partyBody.createdBy }).then((user) => {
            const foundUser = new AuthSchema(user)
            AuthSchema.updateOne({ "_id": foundUser._id }, {
                $push: {
                    createdParties: { "partyId": partyCreated._id, "location": partyBody.location }
                }
            }).then((party) => {
                res.status(200).json({ message: "Party created successfully", partyId: partyCreated._id, success: true });
            }).catch((partyCreationErr) => {
                res.status(500).json({ error: partyCreationErr, success: false });
            })

        }).catch((err) => {
            res.status(500).json({ error: "Error adding party in user object", success: false });
        })

        // res.status(200).json({ message: "Party created successfully", partyId: result._id, success: true });
    }).catch(err => {
        res.status(500).json({ error: err, success: false });
    
    })});


router.post('/updateParty', upload.array('partyImage', 5), async (req, res, next) => {
    console.log(req.files);
    console.log(req.body.partyId);
    var list = new Array();
    req.files.forEach(element => {
       list.push(element.path);
   })
   console.log(list);
    res.send("Party updated");
    const partyId = req.body.partyId;
    PartySchemas.findById(partyId).then((party) => {
        const partyone = new PartySchemas(party);
        PartySchemas.updateOne({ "_id": partyId }, {
            $push : {
                partyImages : list,
            }
        });
    })
});

router.post('/joinParty', (req, res, next) => {
    const partyId = req.body.partyId;
    const guestId = req.body.guestId;
    PartySchemas.findOne({ "_id": partyId }).then((foundParty) => {
        AuthSchema.findOne({ "_id": guestId }).then((foundGuest) => {

            if (foundGuest.joinedParties.length === 0) {

                AuthSchema.updateOne({ "_id": foundGuest._id }, {
                    $push: {
                        joinedParties: { "partyId": foundParty._id, "location": foundParty.location }
                    }
                }).then((updatedParty) => {
                    PartySchemas.updateOne({ "_id": foundParty._id }, {
                        $push: {
                            joinedGuest: { "guestId": foundGuest._id, "username": foundGuest.username, "imageUrl": foundGuest.imageUrl }
                        }
                    }).then((partyJoined) => {
                        res.status(200).json({ message: "Party joined successfully", success: true });
                    }).catch((errorJoining) => {
                        console.log(errorJoining)
                        res.status(500).json({ error: "Error joining party", success: false });
                    })
                })
            } else {

                var found = false
                foundGuest.joinedParties.forEach((parties) => {
                    if (parties.partyId === partyId) {
                        found = true
                        res.status(500).json({ error: "You are already a guest of this party", success: false });
                    }
                })



                if (found === false) {
                    AuthSchema.updateOne({ "_id": foundGuest._id }, {
                        $push: {
                            joinedParties: { "partyId": foundParty._id, "location": foundParty.location }
                        }
                    }).then((updatedParty) => {
                        PartySchemas.updateOne({ "_id": foundParty._id }, {
                            $push: {
                                joinedGuest: { "guestId": foundGuest._id, "username": foundGuest.username, "imageUrl": foundGuest.imageUrl }
                            }
                        }).then((partyJoined) => {
                            res.status(200).json({ message: "Party joined successfully", success: true });
                        }).catch((errorJoining) => {
                            console.log(errorJoining)
                            res.status(500).json({ error: "Error joining party", success: false });
                        })
                    })
                }

            }

        }).catch((userNotFoundErr) => {
            res.status(500).json({ error: "User not found", success: false });
        })
    }).catch(partyNotFoundErr => {
        res.status(500).json({ error: "Party not found", success: false });
    })
})

router.post('/bidOnParty', async function(req, res, next) {
    const { guestId, partyId, amount, username } = req.body;

    const currentParty = await PartySchemas.findOne({ "_id": partyId });

    if (currentParty.bids.length === 0) {
        PartySchemas.updateOne({ "_id": partyId }, {
            $push: {
                bids: { "guestId": guestId, "amount": amount, "username": username }
            }
        }).then((bidPlaced) => {
            AuthSchema.updateOne({ "_id": guestId }, {
                $push: {
                    placedBids: { "partyId": partyId, "amount": amount }
                }
            }).then((success) => {
                res.status(200).json({ message: "Bid placed successfully", success: true });
            })
        }).catch((bidErr) => {
            res.status(500).json({ error: bidErr, success: false });
        })
    } else {
        var found = false;
        console.log(currentParty.bids)
        currentParty.bids.forEach((bid) => {
            if (bid.amount < amount) {
                found = true
            }
        })
        console.log(found)
        if (found === false) {
            res.status(200).json({ message: "You must bid higher", success: true });
        } else {
            PartySchemas.updateOne({ "_id": partyId }, {
                $push: {
                    bids: { "guestId": guestId, "amount": amount, "username": username }
                }
            }).then((bidPlaced) => {
                AuthSchema.updateOne({ "_id": guestId }, {
                    $push: {
                        placedBids: { "partyId": partyId, "amount": amount }
                    }
                }).then((success) => {
                    res.status(200).json({ message: "Bid placed successfully", success: true });
                })
            }).catch((bidErr) => {
                res.status(500).json({ error: bidErr, success: false });
            })
        }
    }



})

router.get('/highestBid/:partyId', async function(req, res, next) {
    const partyId = req.params.partyId;

    const currentParty = await PartySchemas.findOne({ "_id": partyId });
    if (currentParty != null) {
        if (currentParty.bids.length === 0) {
            res.status(200).json({ highestBid: 0, success: true });
        } else {
            var highestBid = 0;
            currentParty.bids.forEach((bid) => {
                if (bid.amount > highestBid) {
                    highestBid = bid.amount
                }
            })
            console.log(highestBid)
            res.status(200).json({ highestBid: highestBid, success: true });
        }
    } else {
        res.status(500).json({ error: "No Such party", success: false });
    }


})


module.exports = router;