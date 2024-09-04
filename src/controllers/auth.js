import { User } from '../models/User';

export const auth = async (req, res) => {
  const { phone, email, password } = req.body;

  try {
    let user = await User.findOne({ phone: phone });

    if (user) {
      return res.json({ message: 'Login successful', user: user });
    } else {
      let newUser = new User({
        phone: phone,
        email: email,
        password: password,
        name: '',
        city: '',
      });

      newUser = await newUser.save();
      return res
        .status(201)
        .json({ message: 'Registration successful', user: newUser });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeName = async (req, res) => {
  const { id, name } = req.body;

  try {
    let user = await User.findOne({ _id: id });

    console.log(user);

    if (user) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { name: name },
        { new: true }
      );

      return res.json({
        message: 'Name updated successfully',
        user: updatedUser,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const userDetail = async (req, res) => {
  const { phone, email } = req.body;

  try {
    if (!phone && !email) {
      return res.status(400).json({ user: null });
    }

    let user;
    if (phone) {
      user = await User.findOne({ phone: phone });
    }

    if (!user && email) {
      user = await User.findOne({ email: email });
    }

    if (!user) {
      return res.status(404).json({ user: null });
    }

    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
