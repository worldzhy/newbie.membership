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
import {BillingCycle, Prisma} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({summary: 'List all subscriptions'})
  listSubscriptions(@Body() body: ListSubscriptionsRequestDto) {
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Subscription,
      pagination: {page: body.page, pageSize: body.pageSize},
    });
  }

  @Post()
  @ApiOperation({summary: 'Create a new subscription'})
  async createSubscription(@Body() body: CreateSubscriptionRequestDto) {
    const {userId, planId} = body;

    // Validate membership and plan existence
    const membership = await this.prisma.membership.findUniqueOrThrow({
      where: {userId},
      select: {id: true},
    });
    const plan = await this.prisma.subscriptionPlan.findUniqueOrThrow({
      where: {id: planId},
    });

    // Create the subscription
    const dateOfStart = new Date();
    let dateOfEnd: Date;
    if (plan.billingCycle === BillingCycle.MONTHLY) {
      dateOfEnd = new Date(dateOfStart);
      dateOfEnd.setMonth(dateOfStart.getMonth() + 1);
    } else if (plan.billingCycle === BillingCycle.QUARTERLY) {
      dateOfEnd = new Date(dateOfStart);
      dateOfEnd.setMonth(dateOfStart.getMonth() + 3);
    } else if (plan.billingCycle === BillingCycle.ANNUALLY) {
      dateOfEnd = new Date(dateOfStart);
      dateOfEnd.setFullYear(dateOfStart.getFullYear() + 1);
    } else {
      throw new Error('Unsupported billing cycle');
    }

    return this.prisma.subscription.create({
      data: {
        dateOfStart,
        dateOfEnd,
        amountPaid: plan.price,
        memberId: membership.id,
        planId,
      },
    });
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing subscription'})
  updateSubscription(
    @Param() params: GetSubscriptionRequestDto,
    @Body() body: UpdateSubscriptionRequestDto
  ) {
    return this.prisma.subscription.update({
      where: {id: params.id},
      data: body,
    });
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete a subscription plan'})
  deleteSubscriptionPlan(@Param() params: GetSubscriptionPlanRequestDto) {
    return this.prisma.subscriptionPlan.delete({where: {id: params.id}});
  }
}
