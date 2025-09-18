import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ResponseMessage, User } from 'src/decorator/customize.decorator';
import { IUser } from 'src/user/user.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ResponseMessage('Create a new Payment')
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @User() user: IUser
  ) {
    const newPayment = await this.paymentsService.create(createPaymentDto, user);
    return {
      id: newPayment?.id,
      createdAt: newPayment?.createdAt
    }
  }

  @Get()
  @ResponseMessage('Fetch all payments')
  findAll(
    @Query('current') currentPage: string, 
    @Query('pageSize') limit: string, 
    @Query() qs: string
  ) {
    return this.paymentsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch payment by id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a Payment')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete a Payment')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
