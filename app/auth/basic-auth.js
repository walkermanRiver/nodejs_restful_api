import * as userService from'../db/user-service.js';

async function auth(req, res, next) {
    // make authenticate path public
    if (req.path === '/users/authenticate') {
        return next();
    }

    // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.set('WWW-Authenticate', 'Basic realm="401"')
        .status(401)
        .json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const user = await userService.getAuthenticatedUser({ username, password });
    if (!user) {
        return res.set('WWW-Authenticate', 'Basic realm="401"')
        .status(401)
        .json({ message: 'Invalid Authentication Credentials' })
        .end();
    }

    // attach user to request object
    req.user = user

    next();
}

// const exports = {
//   auth: basicAuth
// };

// export const auth = basicAuth;
export default {
  auth
}
