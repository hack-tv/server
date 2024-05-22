const { OAuth2Client } = require('google-auth-library');

const { signToken } = require('../helpers/jwt');
const { Profile, User } = require('../models/index');

class AuthController {
  static async googleLogin(req, res, next) {
    try {
      const { token } = req.headers;

      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const [user, created] = await User.findOrCreate({
        where: {
          email: payload.email,
        },
        defaults: {
          email: payload.email,
          password: Math.random().toString(36).substring(7),
        },
      });

      if (created) {
        await Profile.create({ name: payload.name, imageUrl: payload.picture, UserId: user.id });
      }

      const access_token = signToken({ email: user.email });

      res.status(200).json({ access_token });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
