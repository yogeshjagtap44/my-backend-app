import { HttpException, HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
 import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    try {
      return await this.usersRepository.save({...createUserInput, password: await bcrypt.hashSync(createUserInput.password, 10)});

    } catch (err) {
      if (err.message.includes('Duplicate entry')) {
        throw new UnprocessableEntityException('Email already exists');
      }
    }
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    // Step 1: Check if the user exists
    const userExist = await this.findOne(id);
    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Step 2: Check for duplicate email
    if (updateUserInput.email && updateUserInput.email !== userExist.email) {
      const existingUserWithEmail = await this.usersRepository.findOne({
        where: { email: updateUserInput.email },
      });
      if (existingUserWithEmail) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
    }

    // Step 3: Hash the password if provided
    if (updateUserInput.password) {
      updateUserInput.password = await bcrypt.hash(updateUserInput.password, 10);
    }

    // Step 4: Update the user
    Object.assign(userExist, updateUserInput);
    await this.usersRepository.update(id, userExist);

    // Step 5: Fetch and return the updated user
    return this.findOne(id);
  }

  async verifyUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }
}
