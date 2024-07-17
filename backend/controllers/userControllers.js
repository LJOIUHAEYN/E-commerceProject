// import User from "../models/userModels.js";
// import asyncHandler from "../middlewares/asyncHandler.js";
// import bcrypt from "bcryptjs";
// import creatToken from "../utils/creatToken.js";

// const createUser = asyncHandler(async (req, res) => {
//   const { userName, email, password } = req.body;

//   if (!userName || !email || !password) {
//     throw new Error("please fill all the inputs...!");
//   }

//   const userExists = await User.findOne({ email });
//   if (userExists) {
//     res.status(400).send("user already exists..");
//     return;
//   }

//   const salt = await bcrypt.genSalt(10);
//   const hashedPassowrd = await bcrypt.hash(password, salt);

//   const newUser = new User({ userName, email, password: hashedPassowrd });

//   try {
//     await newUser.save();
//     creatToken(res, newUser._id);
//     res.status(201).json({
//       _id: newUser._id,
//       userName: newUser.userName,
//       email: newUser.email,
//       isAdmin: newUser.isAdmin,
//     });
//   } catch (error) {
//     res.status(400);
//     throw new Error("invalid user data");
//   }
// });

// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     res.status(400);
//     throw new Error("Please provide email and password.");
//   }

//   const existingUser = await User.findOne({ email });

//   if (existingUser) {
//     const isPasswordValid = await bcrypt.compare(
//       password,
//       existingUser.password
//     );

//     if (isPasswordValid) {
//       creatToken(res.existingUser._id);

//       res.status(201).json({
//         _id: existingUser._id,
//         userName: existingUser.userName,
//         email: existingUser.email,
//         isAdmin: existingUser.isAdmin,
//       });
//       return;
//     } else {
//       res.status(401);
//       throw new Error("Invalid password.");
//     }
//   }else {
//     res.status(404);
//     throw new Error("User not found.");
//   }
// });
// export { createUser, loginUser };
import User from "../models/userModels.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the inputs!");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).send("User already exists.");
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ userName, email, password: hashedPassword });

  try {
    await newUser.save();
    createToken(res, newUser._id);
    res.status(201).json({
      _id: newUser._id,
      userName: newUser.userName,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password.");
  }

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    res.status(404);
    throw new Error("User not found.");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid password.");
  }

  createToken(res, existingUser._id);

  res.status(200).json({
    _id: existingUser._id,
    userName: existingUser.userName,
    email: existingUser.email,
    isAdmin: existingUser.isAdmin,
  });
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "logged out  Succ.." });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      userName: user.userName,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found..!");
  }
});

  const updateCurrentUserProfile = asyncHandler(async (req, res ) => {
    const user = await User.findById(req.user._id)

    if(user) {
      user.userName = req.body.userName || user.userName;
      user.email = req.body.email || user.email;

      if(req.body.password) {
        const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;
      }


      const updateUser =  await user.save();
      res.json({
        _id: updateUser._id,
        userName: updateUser.userName,
        email:updateUser.email,
        isAdmin: updateUser.isAdmin,
      });

    }else {
      res.status(404);
      throw new Error("User not found..");
    }
  });

  const deleteUserById = asyncHandler(async (req, res) => {
     const user = await User.findById(req.params.id);
     if (user) {
      if (user.isAdmin) {
        res.status(400)
        throw new Error("Connot delete admin user")
      }
      await User.deleteOne({_id: user._id})
      res.json({message: "user removed"})
     }else {
      res.status(404);
      throw new Error("User not found.")
     }
  }); 

  const getUserById = asyncHandler(async ( req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    
    if (user) {
      res.json(user)
    }else {
      res.status(404)
      throw new Error("User not found..")
    }
  });

  const updateUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user){
      user.userName = req.body.userName || user.userName
      user.email = req.body.email || user.email
      user.isAdmin = Boolean(req.body.isAdmin)

      const updatedUser= await  user.save()
      res.json({
        _id: updatedUser._id,
        userName: updatedUser.userName,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin
      })
    }else {
      res.status(404)
      throw new Error("User not found..")
    }
  })
export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};
