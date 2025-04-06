import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  // Check if a token exists in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; //attach user to request to use in another route

      next(); // Allow request to proceed
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ success: false, message: "No token provided, access denied" });
  }
};
