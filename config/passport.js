const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

const passportInitStrategies = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id)
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (err) {
                console.log(err)
            }
        })
    );

    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback',
            },
            function (accessToken, refreshToken, profile, done) {
                done(null, profile);
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

};

module.exports = passportInitStrategies;