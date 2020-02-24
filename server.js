const { ApolloServer } = require('apollo-server');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
require('dotenv').config();

const mongoose = require('mongoose');
const { findOrCreateUser } = require('./controllers/UserController');


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log('Conneted');
}).catch(() => {
    console.log('Nope!');
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) => {
        let authToken = null;
        let currentUser = null;
        try{
            authToken = req.headers.authorization;
            if (authToken) {
                currentUser = await findOrCreateUser(authToken);
            }
        }catch (e) {
            console.log(e);
        }

        // to make it available to our resolvers
        return { currentUser }
    }
});

server.listen().then( ({url}) => {
    console.log(url);
});

