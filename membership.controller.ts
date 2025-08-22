import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {PrismaService} from '@framework/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {MembershipService} from './membership.service';
import {
  GetMembershipRequestDto,
  ListMembershipLevelsRequestDto,
  UpdateMembershipRequestDto,
} from './membership.dto';

@ApiTags('Membership')
@ApiBearerAuth()
@Controller('memberships')
export class MembershipController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService
  ) {}

  @Get('me')
  @ApiOperation({summary: 'Get membership information for the current user'})
  async getMembership(@Req() req) {
    const membership = await this.prisma.membership.findUniqueOrThrow({
      where: {userId: req.user.id},
      select: {id: true},
    });

    return this.membershipService.getMembership(membership.id);
  }

  @Get()
  @ApiOperation({summary: 'List all memberships'})
  async listMemberships(@Query() query: ListMembershipLevelsRequestDto) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Membership,
      pagination: {page: query.page, pageSize: query.pageSize},
    });
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing membership'})
  async updateMembership(
    @Param() params: GetMembershipRequestDto,
    @Body() body: UpdateMembershipRequestDto
  ) {
    return await this.prisma.membership.update({
      where: {id: params.id},
      data: body,
    });
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete a membership'})
  async deleteMembership(@Param() params: GetMembershipRequestDto) {
    return await this.prisma.membership.delete({where: {id: params.id}});
  }
}
