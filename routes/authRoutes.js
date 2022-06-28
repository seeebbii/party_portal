const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController');


router.get('/', (req, res, next) => {
    res.send('Welcome to the Auth end point');
})

router.get('/all', authController.getAll)
router.get('/all/:id', authController.getById)


router.get('/all/created/:userId', authController.getbyUserId)
router.get('/all/joined/:userId', authController.getByUserJoined)

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/update/:id', authController.updateById)




module.exports = router;