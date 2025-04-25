export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ message: "Access denied" });
      }
      // console.log("Authorized role: ", req.user.role);
      next();
  };
};
