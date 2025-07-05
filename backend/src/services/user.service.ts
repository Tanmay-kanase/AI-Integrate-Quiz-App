import User from "../models/user.model";
import bcrypt from "bcrypt";
import HttpException from "../exceptions/HttpException";
import { generateToken } from "../utils/jwt";

class UserService {
  async register(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new HttpException(409, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const userId = (user._id as any).toString();
    const token = generateToken({ userId, email: user.email });

    return { token, user };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new HttpException(404, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new HttpException(401, "Invalid credentials");

    const userId = (user._id as any).toString();
    const token = generateToken({ userId, email: user.email });

    return { token, user };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new HttpException(404, "User not found");
    return user;
  }
}

export default UserService;
