import {PrismaService} from '@framework/prisma/prisma.service';
import {Body, Controller, Param, Patch, Post, Req} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiOperation} from '@nestjs/swagger';
import {GuardByApiKey} from '@microservices/account/security/passport/api-key/api-key.decorator';
import {MembershipService} from '@microservices/membership/membership.service';
import {SubscriptionService} from '@microservices/membership/subscription/subscription.service';
import {
  CreateSubscriptionRequestDto,
  GetSubscriptionRequestDto,
  UpdateSubscriptionRequestDto,
} from '../subscription.dto';
import {SubscriptionStatus} from '@prisma/client';

@ApiTags('Membership / Subscription')
@ApiBearerAuth()
@Controller('wechat-subscriptions')
export class WechatSubscriptionController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membershipService: MembershipService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @GuardByApiKey()
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

    // [step 2] Check if there's an existing active subscription for the plan
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        membershipId: membership.id,
        planId: body.planId,
        status: SubscriptionStatus.PENDING_PAYMENT,
      },
    });
    if (subscription) {
      return subscription;
    }

    // [step 3] Create the subscription
    return await this.subscriptionService.createSubscription({
      membershipId: membership.id,
      planId: body.planId,
    });
  }

  @GuardByApiKey()
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

  /* End */
}
