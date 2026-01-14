export const requireActiveSeller = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  if (req.user.role !== 'seller') {
    return res
      .status(403)
      .json({ message: 'Only sellers can perform this action' });
  }

  if (req.user.status !== 'active') {
    return res.status(403).json({ message: 'Seller account is not active' });
  }

  next();
};