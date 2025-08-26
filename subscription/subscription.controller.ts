import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';
import {MembershipService} from '../membership.service';
import {SubscriptionService} from './subscription.service';
import {
  CreateSubscriptionRequestDto,
  GetSubscriptionPlanRequestDto,
  GetSubscriptionRequestDto,
  ListSubscriptionsRequestDto,
  UpdateSubscriptionRequestDto,
} from './subscription.dto';

@ApiTags('Membership / Subscription')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Get()
  @ApiOperation({summary: 'List all subscriptions'})
  async listSubscriptions(@Query() query: ListSubscriptionsRequestDto) {
    const result = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Subscription,
      pagination: {page: query.page, pageSize: query.pageSize},
    });

    // Collect membership IDs
    const membershipIds = result.records.map(
      subscription => subscription.membershipId
    );
    const memberships = await this.prisma.membership.findMany({
      where: {id: {in: membershipIds}},
      select: {id: true, userId: true},
    });

    // Collect user IDs
    const userIds = memberships.map(membership => membership.userId);
    const users = await this.prisma.user.findMany({
      where: {id: {in: userIds}},
      select: {id: true, name: true, phone: true},
    });

    // Map membershipId to user name and phone
    const membershipIdToUserInfo = new Map<
      string,
      {name: string; phone: string}
    >();
    for (const membership of memberships) {
      const user = users.find(u => u.id === membership.userId);
      membershipIdToUserInfo.set(membership.id, {
        name: user?.name || 'Unknown',
        phone: user?.phone || 'Unknown',
      });
    }

    // Attach user name and phone to each subscription record
    for (const subscription of result.records) {
      const userInfo = membershipIdToUserInfo.get(
        subscription.membershipId
      ) || {
        name: 'Unknown',
        phone: 'Unknown',
      };
      (subscription as any).userName = userInfo.name;
      (subscription as any).userPhone = userInfo.phone;
    }

    return result;
  }

  @Post()
  @ApiOperation({summary: 'Create a new subscription'})
  async createSubscription(@Body() body: CreateSubscriptionRequestDto) {
    // [step 1] Find or create the membership for the user
    let membership = await this.prisma.membership.findUnique({
      where: {userId: body.userId},
      select: {id: true},
    });
    if (!membership) {
      membership = await this.membershipService.createMembership({
        userId: body.userId,
      });
    }

    // [step 2] Create the subscription
    return await this.subscriptionService.createSubscription({
      membershipId: membership.id,
      planId: body.planId,
    });
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing subscription'})
  async updateSubscription(
    @Param() params: GetSubscriptionRequestDto,
    @Body() body: UpdateSubscriptionRequestDto
  ) {
    return await this.prisma.subscription.update({
      where: {id: params.id},
      data: body,
    });
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete a subscription plan'})
  async deleteSubscriptionPlan(@Param() params: GetSubscriptionPlanRequestDto) {
    return await this.prisma.subscriptionPlan.delete({where: {id: params.id}});
  }
}
