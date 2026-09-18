const userModel = require("../models/auth.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const redis = require("../config/cache")



async function registerController(req, res) {
    const { email, password, username } = req.body
    
    if (!password || !username) {
    return res.status(400).json({ message: "Username and password are required" })
  }
    const ifUserAlreadyExists = await userModel.findOne({
        $or: [{ email }, { username }]
    })

    if (ifUserAlreadyExists) {
        return res.status(409).json({
            message: "user already exists with that email"
        })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        username,
        email,
        password: hash,
        provider: "local" 
    })

    const token = jwt.sign({
        id: user._id,
        email:(await user).email
    }, process.env.JWT_SECRET, {
        expiresIn: "3d"
    })
    
    res.cookie("jwt_token",token)

    res.status(201).json({
        message: "Registered successfully",user
    })
}

async function loginController(req, res) {
    const { email, password,username} = req.body
    if (!password) {
        return res.status(400).json({
            message:"password is required"
        })
    }
      const user = await userModel.findOne({$or:[{email},{username}]}).select("+password")
    if (!user) {
        return res.status(404).json({
            message:"User does'nt exist"
        })
    }

    if (user.provider === "google") {
    return res.status(400).json({
    message: "Please login using Google"
     })
    }

    if (!user.password) {
    return res.status(400).json({
      message: "Password not set for this user"
    })
  }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    
    if (!isPasswordCorrect) {
        return res.status(404).json({
            message:"Incorrect password"
        })
    }

    const token = jwt.sign({
        id: user._id,
        email:user.email
    }, process.env.JWT_SECRET, {
        expiresIn:"3d"
    })
    
    res.cookie("jwt_token", token)
    
    res.status(201).json("Logged in successfully")
}

async function googleAuthController(req,res) {
    // handled by passport
}

async function googleCallbackController(req,res) {
    const user = req.user
    if (!user) {
        return res.status(404).json({
            message:"Invalid user"
        })
    }
    const token = jwt.sign({
        id: user._id,
        email:user.email
    }, process.env.JWT_SECRET)
    
    res.cookie("jwt_token", token)
    res.redirect('http://localhost:5173/')
  
}

async function getUserDetailsController(req,res) {
    const userId = req.user.id
    const user = await userModel.findById(userId)

    if (!user) {
        return res.status(404).json({
            message:"User not Found"
        })
    }
    res.status(200).json({
        message:"Fetched successfully",user
    })
}

async function logoutController(req, res) {
  const token = req.cookies.jwt_token
  
  res.clearCookie('jwt_token')
  await redis.set(token, 'blacklisted', 'EX', 60 * 60)
  
  res.status(200).json({ message: 'Logged out successfully' })
}


module.exports = {
    registerController,loginController,getUserDetailsController,logoutController,googleCallbackController
}