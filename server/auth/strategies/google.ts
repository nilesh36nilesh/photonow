import { Express, Response } from "express"
import passport from "passport"
import passportGoogle from "passport-google-oauth"
import { to } from "await-to-js"

import { User, GoogleProfile, UserRequest } from "../../../global"
import { getUserByProviderId, createUser } from "../../database/user"
import { signToken, getRedirectUrl } from "../utils"
import { ROLES } from "../../../utils/roles"

const GoogleStrategy = passportGoogle.OAuth2Strategy

const strategy = (app: Express) => {
  const strategyOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_API_URL}/auth/google/callback`
  }

  const verifyCallback = async (
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done
  ) => {
    let [err, user] = await to(getUserByProviderId(profile.id))
    if (err || user) {
      return done(err, user)
    }

    const verifiedEmail = profile.emails.find(email => email.verified) || profile.emails[0]

    const [createdError, createdUser] = await to(
      createUser(<User>{
        provider: profile.provider,
        providerId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        displayName: profile.displayName,
        email: verifiedEmail.value,
        role: ROLES.Customer,
        password: null
      })
    )

    return done(createdError, createdUser)
  }

  passport.use(new GoogleStrategy(strategyOptions, verifyCallback))

  app.get(
    `${process.env.BASE_API_URL}/auth/google`,
    passport.authenticate("google", {
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
      ]
    })
  )

  app.get(
    `${process.env.BASE_API_URL}/auth/google/callback`,
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: UserRequest, res: Response) => {
      return res
        .status(200)
        .cookie("jwt", signToken(req.user), {
          httpOnly: true
        })
        .redirect(getRedirectUrl(req.user.role))
    }
  )

  return app
}

export { strategy }