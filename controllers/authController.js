import { createUser, loginUser } from "../services/authService.js";

import { generateAccessToken } from "../utils/token.js";

// --------------------------------------------------
// COOKIE OPTIONS
// --------------------------------------------------

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction ? "none" : "lax",

    path: "/",

    maxAge: 24 * 60 * 60 * 1000,
  };
}

// --------------------------------------------------
// SIGNUP
// --------------------------------------------------

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const user = await createUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await loginUser({
      email,
      password,
    });

    // ----------------------------------------------
    // GENERATE JWT
    // ----------------------------------------------

    const token = generateAccessToken(user);

    // ----------------------------------------------
    // SET AUTH COOKIE
    // ----------------------------------------------

    res.cookie("access_token", token, getAuthCookieOptions());

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
}

// --------------------------------------------------
// CURRENT USER
// --------------------------------------------------

export async function getCurrentUser(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

export async function logout(req, res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("access_token", {
    httpOnly: true,

    secure: isProduction,

    sameSite: isProduction ? "none" : "lax",

    path: "/",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
}
