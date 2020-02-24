const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

const verifyOAuthToken = async token => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.OAUTH_CLIENT_ID
        });
        return ticket.getPayload();
    }catch (e) {
        console.log(e);
    }
};

const checkIfUserExists = async email => await User.findOne({ email }).exec();

const createNewUser = googleUser => {
    const { name, email, picture } = googleUser;
    const user = { name, email, picture };
    return new User(user).save();
};

exports.findOrCreateUser = async token => {
    const googleUser = await verifyOAuthToken(token);
    const user = await checkIfUserExists(googleUser.email);
    return user ? user : createNewUser(googleUser)
};