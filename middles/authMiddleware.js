import jwt from 'jsonwebtoken'
import TokenBlacklistModel from '../schema/TokenBlacklistModel.js'
import dotenv from 'dotenv'
import AdminModel from '../schema/AdminModel.js'

dotenv.config()

const protect = async (req, res, next) => {
  console.log('cookies received:', req.cookies)
  try {
    const token = req.cookies.sfd_access

    if (!token) return res.status(401).json({ msg: "Unauthorized"})
      console.log(token);
      
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
      console.log("decoded");
      
      console.log(decoded);
      
    } catch (error) {
      if (error.name === "TokenExpiredError") return res.status(401).json({ message: 'Token expired', expired: true })
        console.log(error);
        
        return res.status(401).json({ message: 'Invalid token' })
    }

    const isBlackListed = await TokenBlacklistModel.findOne({token}) // find always return an array even it's empty. so it's truthy when even empty
    if(isBlackListed) return res.json({msg:"Invalidated"})


    const admin = await AdminModel.findById(decoded.id)
    if(!admin) return res.json({msg:"Admin no longer available"})

      // STEP 5: Attach admin to request
    req.admin = admin  // ← now available in every controller

    // STEP 6: Pass to next (controller)
    next()

  } catch (err) {
    console.error('authMiddleware error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
export default protect;
