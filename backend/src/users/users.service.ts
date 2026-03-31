import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.interface';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 'u-1', name: 'Alice', email: 'alice@example.com', address: '123 Solar Alley', role: 'CUSTOMER' },
    { id: 'u-2', name: 'Bob', email: 'bob@example.com', address: '456 Wind Road', role: 'CUSTOMER' },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  create(dto: CreateUserDto): User {
    const user: User = {
      id: uuidv4(),
      name: dto.name,
      email: dto.email,
      address: dto.address,
      role: dto.role ?? 'CUSTOMER',
    };
    this.users.push(user);
    return user;
  }
}
