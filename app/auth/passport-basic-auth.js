import passport from 'passport';
import {BasicStrategy} from 'passport-http'
import * as userService from'../db/user-service.js';

passport.use(new BasicStrategy(
  async function(username, password, done) {
    const user = await userService.getAuthenticatedUser({ username, password });
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  }
));

function getAuth(){
  return passport.authenticate('basic', { session: false })
}

export default {
  getAuth
}
