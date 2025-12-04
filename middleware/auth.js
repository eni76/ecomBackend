const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

exports.isUser = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]
  console.log('tok:', token)

  if (!token) {
    return res.status(401).json({ success: false, messag: 'No token Provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    // console.log("decodeded:", decoded);

    next()
  } catch (error) {
    console.log(error.messag)
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

exports.isAdmin = (req, res, next) => {
  if (req.user?.role === 'ADMIN') {
    next()
    return
  }
  return res.status(403).json({
    success: false,
    messag: 'Forbidden route. Only admins can access this route'
  })
}

exports.isSameUser = (req, res, next) => {
  const { uuid } = req.params
  if (req.user?.uuid !== uuid) {
    return res
      .status(403)
      .json({ success: false, message: 'Wrong profile. Is this your Profile!' })
  }

  return next()
}
