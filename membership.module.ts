import {Global, Module} from '@nestjs/common';
import {MembershipController} from './membership.controller';
import {MembershipLevelController} from './membership-level.controller';
import {SubscriptionController} from './subscription/subscription.controller';
import {SubscriptionPlanController} from './subscription/subscription-plan.controller';

@Global()
@Module({
  controllers: [
    MembershipController,
    MembershipLevelController,
    SubscriptionController,
    SubscriptionPlanController,
  ],
})
export class MembershipModule {}
