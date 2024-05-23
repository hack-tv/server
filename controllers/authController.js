const { OAuth2Client } = require('google-auth-library');

const { comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const { Profile, User, sequelize } = require('../models/index');

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, imageUrl, email, password } = req.body;

      const [user, profile] = await sequelize.transaction(async (t) => {
        const user = await User.create({ email, password }, { transaction: t });
        const profile = await Profile.create(
          { name, imageUrl, UserId: user.id },
          { transaction: t }
        );

        return [user, profile];
      });

      res.status(201).json({
        id: user.id,
        email: user.email,
        name: profile.name,
        imageUrl: profile.imageUrl,
      });
    } catch (error) {
      next(error);
    }
  }

  static async defaultLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return next({ statusCode: 400, message: 'Email is required' });
      }

      if (!password) {
        return next({ statusCode: 400, message: 'Password is required' });
      }

      const user = await User.findOne({ where: { email } });

      if (!user || !(await comparePassword(password, user.password))) {
        return next({ statusCode: 401, message: 'Invalid email or password' });
      }

      const profile = await Profile.findOne({ where: { UserId: user.id } });

      const access_token = signToken({
        name: profile.name,
        imageUrl: profile.imageUrl,
        email: user.email,
      });

      res.status(200).json({ access_token });
    } catch (error) {
      next(error);
    }
  }

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

      const access_token = signToken({
        name: payload.name,
        imageUrl: payload.picture,
        email: payload.email,
      });

      res.status(200).json({ access_token });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
