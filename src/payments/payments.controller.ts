import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ResponseMessage, GetUser } from 'src/decorator/customize.decorator';
import { IUser } from 'src/user/user.interface';
import { PoliciesGuard } from 'src/auth/policy.guard';
import { CheckPolicies } from 'src/decorator/policy.decorator';
import { Action } from 'src/enum/action.enum';
import { Payment } from './schemas/payment.schema';

@Controller('payments')
@UseGuards(PoliciesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Create, Payment),
    message: 'Bạn không có quyền tạo mới Payment'
  })
  @ResponseMessage('Create a new Payment')
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() user: IUser
  ) {
    const newPayment = await this.paymentsService.create(createPaymentDto, user);
    return {
      id: newPayment?.id,
      createdAt: newPayment?.createdAt
    }
  }

  @Get()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Read_All, Payment),
    message: 'Bạn không có quyền xem tất cả danh sách Payment'
  })
  @ResponseMessage('Fetch all payments')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.paymentsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Read, Payment),
    message: 'Bạn không có quyền xem danh sách Payment'
  })
  @ResponseMessage('Fetch payment by id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Payment),
    message: 'Bạn không có quyền cập nhật Payment'
  })
  @ResponseMessage('Update a Payment')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Payment),
    message: 'Bạn không có quyền xóa Payment'
  })
  @ResponseMessage('Delete a Payment')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
