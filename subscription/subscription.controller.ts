import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
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
  async listSubscriptions(@Body() body: ListSubscriptionsRequestDto) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Subscription,
      pagination: {page: body.page, pageSize: body.pageSize},
    });
  }

  @Post()
  @ApiOperation({summary: 'Create a new subscription'})
  async createSubscription(
    @Req() req,
    @Body() body: CreateSubscriptionRequestDto
  ) {
    // [step 1] Find or create the membership for the user
    let membership = await this.prisma.membership.findUnique({
      where: {userId: req.user.id},
      select: {id: true},
    });
    if (!membership) {
      membership = await this.membershipService.createMembership({
        userId: req.user.id,
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
