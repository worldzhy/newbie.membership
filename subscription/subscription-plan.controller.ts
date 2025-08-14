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
  CreateSubscriptionPlanRequestDto,
  GetSubscriptionPlanRequestDto,
  ListSubscriptionPlansRequestDto,
  UpdateSubscriptionPlanRequestDto,
} from './subscription.dto';

@ApiTags('Membership / Subscription')
@ApiBearerAuth()
@Controller('subscriptions/plans')
export class SubscriptionPlanController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({summary: 'List all subscription plans'})
  listSubscriptionPlans(@Body() body: ListSubscriptionPlansRequestDto) {
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.SubscriptionPlan,
      pagination: {page: body.page, pageSize: body.pageSize},
    });
  }

  @Post()
  @ApiOperation({summary: 'Create a new subscription plan'})
  createSubscriptionPlan(@Body() body: CreateSubscriptionPlanRequestDto) {
    return this.prisma.subscriptionPlan.create({data: body});
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing subscription plan'})
  updateSubscriptionPlan(
    @Param() params: GetSubscriptionPlanRequestDto,
    @Body() body: UpdateSubscriptionPlanRequestDto
  ) {
    return this.prisma.subscriptionPlan.update({
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
