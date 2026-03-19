const cookieOptions = {
  httpOnly: true,
  expires: new Date(
    Date.now() +
      (process.env.COOKIE_EXPIRE_MS
        ? Number(process.env.COOKIE_EXPIRE_MS)
        : 7 * 24 * 60 * 60 * 1000),
  ),
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

export default cookieOptions;
