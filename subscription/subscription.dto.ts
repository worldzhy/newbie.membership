import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {CommonListRequestDto} from '@framework/common.dto';
import {BillingCycle, SubscriptionStatus} from '@prisma/client';

// Subscription Plan Dtos
export class ListSubscriptionPlansRequestDto extends CommonListRequestDto {}

export class CreateSubscriptionPlanRequestDto {
  @ApiProperty({type: String, required: true})
  @IsString()
  name: string;

  @ApiProperty({type: String, enum: BillingCycle, required: true})
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({type: Number, required: true})
  @IsNumber()
  price: number;
}

export class UpdateSubscriptionPlanRequestDto {
  @ApiProperty({type: String, required: false})
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({type: Number, required: false})
  @IsNumber()
  @IsOptional()
  price: number;
}

export class GetSubscriptionPlanRequestDto {
  @ApiProperty({type: Number, required: true})
  @IsNumber()
  id: number;
}

// Subscription Dtos
export class ListSubscriptionsRequestDto extends CommonListRequestDto {}

export class CreateSubscriptionRequestDto {
  @ApiProperty({type: String, required: true})
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({type: Number, required: true})
  @IsNumber()
  @IsNotEmpty()
  planId: number;
}

export class UpdateSubscriptionRequestDto {
  @ApiProperty({type: String, enum: SubscriptionStatus, required: true})
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}

export class GetSubscriptionRequestDto {
  @ApiProperty({type: String, required: true})
  @IsString()
  id: string;
}
