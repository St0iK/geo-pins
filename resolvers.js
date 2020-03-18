const { AuthenticationError } = require('apollo-server');
const Pin = require('./models/Pin');

const user = {
    _id: "1",
    name: 'Reed',
    email: 'jstoikidis@gmail.com',
    picture: 'https://cloudinary.com/asdf',
};

const authenticated = next => (root, args, ctx, info) => {
    if (!ctx.currentUser) {
        throw new AuthenticationError('You must be logged in');
    }
    return next(root, args, ctx, info);
};

module.exports = {
    Query: {
        me: authenticated((root, args, ctx) => ctx.currentUser),
        getPins: async (root, args, ctx) => {
            return await Pin.find({}).populate('author').populate('comments.author');
        }
    },
    Mutation: {
        createPin: authenticated(async (root, args, ctx) => {
            const newPin = await new Pin({
                ...args.input,
                author: ctx.currentUser._id
            }).save();

            return await Pin.populate(newPin, 'author');
        }),
        deletePin: authenticated(async (root, args, ctx) => {
            return await Pin.findOneAndDelete({_id: args.pinId}).exec();
        }),
        createComment: authenticated(async (root, args, ctx) => {
            const newComment = { text: args.text, author: ctx.currentUser._id };
            return await Pin.findOneAndUpdate(
              { _id: args.pinId},
              {$push: {comments: newComment}},
              {new: true}
            ).populate("author").populate("comments.author")

        })
    }
};