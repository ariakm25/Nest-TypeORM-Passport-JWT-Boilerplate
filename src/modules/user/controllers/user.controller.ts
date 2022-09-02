import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { QueryUserDto } from '../dtos/query-user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { RequredRole } from 'src/common/decorators/auth.decorator';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';
import { Role } from '../enums/role.enum';
import { PageDto, PageOptionsDto } from 'src/common/dtos/pages';
import { User } from '../entities/user.entity';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginate-response';

@Controller('users')
@UseGuards(RoleGuard)
@RequredRole(Role.ADMIN)
@ApiBearerAuth()
@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiPaginatedResponse(User)
  findAll(
    @Query() queryUserDto: QueryUserDto,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    return this.userService.findAll(queryUserDto, pageOptionsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateById(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<User> {
    return this.userService.remove(id);
  }
}
