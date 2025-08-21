import {Injectable} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';
import {SubscriptionStatus} from '@prisma/client';

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async getMembership(membershipId: string) {
    // [step 1] Expire old subscriptions
    await this.prisma.subscription.updateMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        dateOfEnd: {lt: new Date()},
        membershipId,
      },
      data: {status: SubscriptionStatus.EXPIRED},
    });

    // [step 2] Get the membership with active subscriptions
    return await this.prisma.membership.findUniqueOrThrow({
      where: {id: membershipId},
      include: {subscriptions: {where: {status: SubscriptionStatus.ACTIVE}}},
    });
  }

  async createMembership(params: {userId: string}) {
    // [step 1] Generate a unique card number
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

    // [step 2] Assign the first level by default
    const firstLevel = await this.prisma.membershipLevel.findFirst({
      orderBy: {requiredPoints: 'asc'},
    });
    return this.prisma.membership.create({
      data: {
        userId: params.userId,
        cardNumber,
        levelId: firstLevel?.id,
      },
    });
  }

  /* End */
}
