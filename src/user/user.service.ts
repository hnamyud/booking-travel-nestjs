import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from './schema/user.schema';
import { compare, compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { IUser } from './user.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>) {}

  gethashPassword = (password: string) => {
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
    const hashPassword = await this.gethashPassword(password);
    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      birthDay,
      gender,
      address,
      role: 'USER',
      createdAt: new Date()
    });
    return newUser;
  }

  create = async (createUserDto: CreateUserDto, iuser: IUser) => {
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
                
    if (Number.isNaN(birthDate.getTime())) {
      throw new BadRequestException('birthDay không hợp lệ (YYYY-MM-DD hoặc ISO-8601)');
    }

    const hashPassword = await this.gethashPassword(password);

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

  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      return `Not found user`;
    };
    return await this.userModel.findOne({
      _id: id
    }).select('-password'); // Loại trừ password
  }

  async update(id: string, updateUserDto: UpdateUserDto, IUser: IUser) {
    let updated;
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User không tồn tại');
    };

    const user = await this.userModel.findOne({
      _id: id
    });

    if(updateUserDto.old_password && updateUserDto.new_password) {
      const isMatch = await compare(updateUserDto.old_password, user.password);
      if(!isMatch) {
        throw new BadRequestException('Mật khẩu cũ không đúng');
      }
      const hashNewPassword = await this.gethashPassword(updateUserDto.new_password);
      updated = await this.userModel.updateOne(
        {
          _id: id
        },
        {
          password: hashNewPassword
        }
      );
      
    } else {
      updated = await this.userModel.updateOne(
      {
        _id: id
      },
      {
        ...updateUserDto,
        updatedBy: {
          _id: IUser._id,
          email: IUser.email
        }
      });
    }
    return updated;
  }

  async remove(id: string, IUser: IUser) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
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
    if(!user._id) {
      throw new BadRequestException('Không có thông tin user');
    }
    const profileUser = await this.userModel.findOne({
      _id: user._id
    }).select('-password'); // Loại trừ password
    return profileUser;
  }

  updateRole = async(id: string, role: string, admin: IUser) => {
    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User không tồn tại');
    }
    return await this.userModel.updateOne({
      _id: id
    }, {
      role,
      updatedBy: {
        _id: admin._id,
        email: admin.email
      }
    });
  }
}
