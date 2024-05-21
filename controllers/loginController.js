const { User, Profile } = require("../models/index");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

class LoginController {
  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const [user, created] = await User.findOrCreate({
        where: {
          email: payload.email,
        },
        defaults: {
          email: payload.email,
          password: "Success login with google",
        },
        hooks: false,
      });

      if (created) {
        await Profile.create({
          name: payload.name,
          UserId: user.id,
        });
      }

      const access_token = signToken({
        email: user.email,
      });

      res.status(200).json({
        message: "Login Success",
        access_token,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = { LoginController };
