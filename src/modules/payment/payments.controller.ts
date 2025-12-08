import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Ip } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ResponseMessage, GetUser, Public } from 'src/core/decorator/customize.decorator';
import { IUser } from 'src/common/interfaces/user.interface';
import { PoliciesGuard } from 'src/core/guards/policy.guard';
import { CheckPolicies } from 'src/core/decorator/policy.decorator';
import { Action } from 'src/common/enum/action.enum';
import { Payment } from './schemas/payment.schema';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(PoliciesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Create, Payment),
    message: 'Bạn không có quyền tạo mới Payment'
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreatePaymentDto })
  @ResponseMessage('Create a new Payment')
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() user: IUser,
    @Ip() ipAddress?: string
  ) {
    const newPayment = await this.paymentsService.create(createPaymentDto, user, ipAddress);
    return {
      id: newPayment?.id,
      paymentUrl: newPayment?.paymentUrl,
      createdAt: newPayment?.createdAt
    }
  }

  @Public()
  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any) {
    return this.paymentsService.handleVnpayIpn(query);
  }

  @Public()
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any) {
    return this.paymentsService.handleVnpayReturn(query);
  }

  @Get()
  @CheckPolicies({ 
    handle: (ability) => ability.can(Action.Read_All, Payment),
    message: 'Bạn không có quyền xem tất cả danh sách Payment'
  })
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
  @ResponseMessage('Fetch payment by id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Update, Payment),
    message: 'Bạn không có quyền cập nhật Payment'
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdatePaymentDto })
  @ResponseMessage('Update a Payment')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @CheckPolicies({
    handle: (ability) => ability.can(Action.Delete, Payment),
    message: 'Bạn không có quyền xóa Payment'
  })
  @ApiBearerAuth('access-token')
  @ResponseMessage('Delete a Payment')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
