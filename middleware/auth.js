const { AuthenticationError } = require("apollo-server");

const jwt = require("jsonwebtoken");

module.exports = (context) => {
    const authHeader = context.req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split("Bearer")[1];
        if (token) {
            try {
                const user = jwt.verify(token, "Unsafe_String");
                return user;
            } catch (error) {
                throw new AuthenticationError("Invalid/Expired token");
            }
        }
        throw new AuthenticationError("authentication token must be Bearer token");
    }
    throw new AuthenticationError("autherization header must be provided");
};
