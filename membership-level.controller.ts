import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';
import {
  CreateMembershipLevelRequestDto,
  GetMembershipLevelRequestDto,
  UpdateMembershipLevelRequestDto,
} from './membership.dto';

@ApiTags('Membership / Level')
@ApiBearerAuth()
@Controller('memberships/levels')
export class MembershipLevelController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({summary: 'List all membership levels'})
  listMembershipLevels() {
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.MembershipLevel,
      pagination: {page: 0, pageSize: 100},
    });
  }

  @Post()
  @ApiOperation({summary: 'Create a new membership level'})
  createMembershipLevel(@Body() body: CreateMembershipLevelRequestDto) {
    return this.prisma.membershipLevel.create({data: body});
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing membership level'})
  updateMembershipLevel(
    @Param() params: GetMembershipLevelRequestDto,
    @Body() body: UpdateMembershipLevelRequestDto
  ) {
    return this.prisma.membershipLevel.update({
      where: {id: params.id},
      data: body,
    });
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete a membership level'})
  deleteMembershipLevel(@Param() params: GetMembershipLevelRequestDto) {
    return this.prisma.membershipLevel.delete({where: {id: params.id}});
  }
}
