import { UpdateRoleDto } from './dto/update-user-role.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from './schema/user.schema';
import { compare, compareSync, genSaltSync, hashSync } from 'bcryptjs';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { UserRole } from 'src/common/enum/role.enum';
import { IUser } from 'src/common/interfaces/user.interface';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schema';
import { Booking, BookingDocument } from '../booking/schemas/booking.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Payment.name) private paymentModel: SoftDeleteModel<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: SoftDeleteModel<BookingDocument>,
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({
      _id
    }, {
      refreshToken
    });
  }

  queryUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken });
  }

  register = async (user: RegisterUserDto) => {
    const { name, email, password, birthDay, gender, address } = user;
    const isExisted = await this.userModel.findOne({ email });
    if (isExisted) {
      throw new BadRequestException(`Email: ${email} đã tồn tại`);
    }
    const birthDate = new Date(birthDay);
    birthDate.setHours(birthDate.getHours() + 12);
    const hashPassword = await this.getHashPassword(password);
    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      birthDay: birthDate,
      gender,
      address,
      role: UserRole.User,
      createdAt: new Date()
    });
    return newUser;
  }

  create = async (createUserDto: CreateUserDto, iuser?: IUser) => {
    if (!iuser || !iuser._id) {
      throw new BadRequestException('Không có thông tin người tạo');
    }

    const {
      name,
      email,
      password,
      birthDay,
      gender,
      address,
      role
    } = createUserDto;
    const isExisted = await this.userModel.findOne({ email });
    if (isExisted) {
      throw new BadRequestException(`Email: ${email} đã tồn tại`);
    }
    const birthDate = new Date(birthDay);
    birthDate.setHours(birthDate.getHours() + 12);

    if (Number.isNaN(birthDate.getTime())) {
      throw new BadRequestException('birthDay không hợp lệ (YYYY-MM-DD hoặc ISO-8601)');
    }

    const hashPassword = await this.getHashPassword(password);

    let user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      birthDay: birthDate,
      gender,
      address,
      role,
      createdBy: {
        _id: iuser._id,
        email: iuser.email,
      },
      createdAt: new Date()
    });
    return user;
  }

  createGoogleUser = async (googleUser: { email: string; name: string }) => {
    const { name, email } = googleUser;
    const isExisted = await this.userModel.findOne({ email });
    if (isExisted) {
      return isExisted;
    }
    
    // Generate a random password for Google users
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashPassword = await this.getHashPassword(randomPassword);

    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      role: UserRole.User,
      createdAt: new Date()
    });
    return newUser;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select('-password') // Loại trừ password
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string, requestUser?: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `Not found user`;
    };
    let selectFields = '-password -refreshToken'; // Luôn ẩn password

    // Nếu không đăng nhập → chỉ hiện thông tin cơ bản
    if (!requestUser) {
      selectFields = 'name email role createdAt'; // Public profile minimal
    }
    // Nếu là chính mình → hiện đầy đủ (trừ password)
    else if (requestUser._id.toString() === id) {
      selectFields = '-password -refreshToken';
    }
    // Nếu là admin → hiện đầy đủ (trừ password)
    else if (requestUser.role === 'ADMIN') {
      selectFields = '-password -refreshToken';
    }
    // User khác → chỉ hiện thông tin cơ bản
    else {
      selectFields = 'name email role createdAt';
    }

    const user = await this.userModel
      .findById(id)
      .select(selectFields)
      .lean();

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, IUser: IUser) {
    let updated;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User không tồn tại');
    };
    const birthDate = new Date(updateUserDto.birthDay);
    birthDate.setHours(birthDate.getHours() + 12);

    updated = await this.userModel.updateOne(
      {
        _id: id
      },
      {
        name: updateUserDto.name,
        email: updateUserDto.email,
        birthDay: birthDate,
        gender: updateUserDto.gender,
        address: updateUserDto.address,
        updatedBy: {
          _id: IUser._id,
          email: IUser.email
        }
      });
    return updated;
  }

  async remove(id: string, IUser: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User không tồn tại');
    }
    await this.userModel.updateOne({
      _id: id
    }, {
      deletedBy: {
        _id: IUser._id,
        email: IUser.email
      }
    });
    return this.userModel.softDelete({
      _id: id
    });
  }

  getProfile = async (user: IUser) => {
    if (!user._id) {
      throw new BadRequestException('Không có thông tin user');
    }
    const profileUser = await this.userModel.findOne({
      _id: user._id
    }).select('-password'); // Loại trừ password
    return profileUser;
  }

  updateRole = async (id: string, updateRoleDto: UpdateRoleDto, admin: IUser) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User không tồn tại');
    }
    return await this.userModel.updateOne({
      _id: id
    }, {
      role: updateRoleDto.role,
      updatedBy: {
        _id: admin._id,
        email: admin.email
      }
    });
  }

  async changePassword(object: IUser, oldPassword: string, newPassword: string) {
    if (!mongoose.Types.ObjectId.isValid(object._id)) {
      throw new BadRequestException('User không tồn tại 1');
    }

    const user = await this.userModel.findOne({ _id: object._id });
    if (!user) {
      throw new BadRequestException('User không tồn tại 2');
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Kiểm tra mật khẩu mới có khác mật khẩu cũ không
    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Mật khẩu mới không được giống mật khẩu cũ');
    }

    const hashNewPassword = this.getHashPassword(newPassword);

    return await this.userModel.updateOne(
      {
        _id: object._id
      },
      {
        password: hashNewPassword
      }
    );
  }

  findOneByEmail = async (email: string) => {
    return await this.userModel.findOne({ email });
  }

  updateUserPassword = async (email: string, password: string) => {
    return await this.userModel.updateOne(
      {
        email: email
      },
      {
        password: password
      }
    );
  }

  fetchAllPaymentsByUser = async (user: IUser, currentPage: number, limit: number, qs: string) => {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    filter.user_id = user._id; // Chỉ lấy payment của chính user đó
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.paymentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.paymentModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select('-__v -metadata -isDeleted -deletedAt') // Loại trừ thông tin không cần thiết
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  fetchAllBookingByUser = async (user: IUser, currentPage: number, limit: number, qs: string) => {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    filter.user_id = user._id; // Chỉ lấy booking của chính user đó
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.bookingModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.bookingModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select('-__v -isDeleted -deletedAt') // Loại trừ thông tin không cần thiết
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }
}
