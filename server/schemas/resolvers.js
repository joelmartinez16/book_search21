const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return await User.findOne({_id: context.user._id});
            }
            throw new AuthenticationError('Please log in.');
        },
        users: async () => {
            return await User.find({});
        }

    },
    Mutation: {
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError(('Email not recognized!'))
            } 
            const correctPW = await user.isCorrectPassword(password);
            if (!correctPW) {
                throw new AuthenticationError('Incorrect password');
            }
            const token = signToken(user);
            return { token, user };
        },
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = singToken(user);
            return {token, user};
        },
        
        removeBook: async (parent, {bookId}, context) => {
            if (contect.user) {
                return await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: {savedBooks: {bookId: bookId}}},
                    {new: true}
                );
            }
            throw new AuthenticationError('Please login');
        },
        saveBook: async (parent, {bookDetails}, context) => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: bookDetails}},
                    {new: true, runValidators: true}
                );
            }
            throw new AuthenticationError('Please login')
        }
    }
}

module.exports = resolvers;