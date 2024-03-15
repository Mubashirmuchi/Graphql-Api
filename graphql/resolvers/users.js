const User = require("../../models/User");
const { ApolloError } = require("apollo-server-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
    Mutation: {
        async registerUser(_, { registerInput: { username, email, password } }) {
            const oldUser = await User.findOne({ email });

            if (oldUser) {
                throw new ApolloError(`A user already exists with the email ${email}`, "user already exists");
            }

            var encryptedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username: username,
                email: email.toLowerCase(),
                password: encryptedPassword,
            });

            const token = jwt.sign({ user_id: newUser._id, email }, "Unsafe_String", { expiresIn: "2h" });
            newUser.token = token;
            const res = await newUser.save();
            console.log(res);
            return {
                id: res.id,
                ...res._doc,
            };
        },
        async loginUser(_, { loginInput: { email, password } }) {
            const user = await User.findOne({ email });

            if (user && (await bcrypt.compare(password, user.password))) {
                const token = jwt.sign({ user_id: user._id, email }, "Unsafe_String", { expiresIn: "2h" });

                user.token = token;
                console.log(user);

                return { id: user.id, ...user._doc };
            } else {
                throw new ApolloError("incorrect password", "INCORRECT_PASSWORD");
            }
        },
    },
    Query: {
        user: (_, { ID }) => User.findById(ID),
    },
};
