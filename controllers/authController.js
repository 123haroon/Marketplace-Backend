import { createUser, loginUser } from "../services/authService.js";

import { generateAccessToken } from "../utils/token.js";

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

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await loginUser({
      email,
      password,
    });

    const token = generateAccessToken(user);

    res.cookie("access_token", token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

export async function logout(req, res) {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
}
