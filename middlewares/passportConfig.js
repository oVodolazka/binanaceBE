// const JwtStrategy = require("passport-jwt").Strategy;
// const GoogleStrategy = require('passport-google-oauth2').Strategy;
// const { ExtractJwt } = require("passport-jwt");

// const User = require('../models/User')
// const clientId = '72871712135-gc9vltdr2au8n7tgdlogu4jbiq9knbf3.apps.googleusercontent.com'
// const clientSecret = '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'

// module.exports = (passport) => {
//     passport.use(new GoogleStrategy(
//         {
//             clientID: clientId,
//             clientSecret: clientSecret,
//             callbackURL: 'http://localhost:3000/auth/google/callback',
//             passReqToCallback: true
//         },
//         async (request, accessToken, refreshToken, profile, done) => {
//             try {
//                 let existingUser = await User.findOne({ 'google.id': profile.id });
//                 // <em>// if user exists return the user</em>
//                 if (existingUser) {
//                     return done(null, existingUser);
//                 }
//                 // <em>// if user does not exist create a new user</em>
//                 console.log('Creating new user...');
//                 const newUser = new User({
//                     method: 'google',
//                     google: {
//                         id: profile.id,
//                         name: profile.displayName,
//                         email: profile.emails[0].value
//                     },
//                     name: profile.displayName,
//                     email: profile.emails[0].value
//                 });
//                 await newUser.save();
//                 return done(null, newUser);
//             } catch (error) {
//                 return done(error, false)
//             }
//         }
//     ));

//     passport.use(
//         new JwtStrategy(
//             {
//                 jwtFromRequest: ExtractJwt.fromHeader("authorization"),
//                 secretOrKey: clientSecret,
//             },
//             async (jwtPayload, done) => {
//                 try {
//                     // <em>// Extract user</em>
//                     const user = jwtPayload.user;
//                     done(null, user);
//                 } catch (error) {
//                     done(error, false);
//                 }
//             }
//         )
//     );
// }
