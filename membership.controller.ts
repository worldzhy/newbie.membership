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
import {PrismaService} from '@framework/prisma/prisma.service';
import {
  CreateMembershipRequestDto,
  GetMembershipRequestDto,
  ListMembershipLevelsRequestDto,
  UpdateMembershipRequestDto,
} from './membership.dto';
import {Prisma} from '@prisma/client';

@ApiTags('Membership')
@ApiBearerAuth()
@Controller('memberships')
export class MembershipController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({summary: 'List all memberships'})
  listMemberships(@Body() body: ListMembershipLevelsRequestDto) {
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Membership,
      pagination: {page: body.page, pageSize: body.pageSize},
    });
  }

  @Post()
  @ApiOperation({summary: 'Create a new membership'})
  async createMembership(@Body() body: CreateMembershipRequestDto) {
    // Generate a unique card number
    let existing = false;
    let cardNumber = '';
    do {
      const a = Math.floor(Math.random() * 10); // 0~9
      const b = Math.floor(Math.random() * 1000); // 0~999
      cardNumber = '9' + `${a}${a}${b}`;
      const count = await this.prisma.membership.count({where: {cardNumber}});

      if (count > 0) {
        existing = true;
      } else {
        existing = false;
      }
    } while (existing);

    // Assign the first level by default
    const firstLevel = await this.prisma.membershipLevel.findFirst({
      orderBy: {requiredPoints: 'asc'},
    });
    return this.prisma.membership.create({
      data: {
        userId: body.userId,
        cardNumber,
        levelId: firstLevel?.id,
      },
    });
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing membership'})
  updateMembership(
    @Param() params: GetMembershipRequestDto,
    @Body() body: UpdateMembershipRequestDto
  ) {
    return this.prisma.membership.update({
      where: {id: params.id},
      data: body,
    });
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete a membership'})
  deleteMembership(@Param() params: GetMembershipRequestDto) {
    return this.prisma.membership.delete({where: {id: params.id}});
  }
}
