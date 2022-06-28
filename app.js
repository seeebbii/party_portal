//! importing all important libraries
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const { MONGO_URI } = require('./service/database');

//! importing routes
const authRoutes = require('./routes/authRoutes')
const partyRoutes = require('./routes/partyRoutes')

//! creating express server
const app = express();
const port = process.env.PORT || 8080;



//! ENABLING CORS
app.use(cors(), (req, res, next) => {
    next()
})

app.use(express.json({ limit: '1000mb' }));

app.use('/images', express.static(path.join(__dirname, 'images')));


//! CONNECTING MONGOOSE 
mongoose.connect(process.env.MONGO_URI || MONGO_URI, { useNewUrlParser: true, }).then(() => console.log('MongoDb Connected')).catch((err) => console.log(err));

const expressServer = app.listen(port, () => console.log(`Server is running on port: ${port}`));


//! API ENDPOINTS
app.use('/api/auth', authRoutes);
app.use('/api/party', partyRoutes);