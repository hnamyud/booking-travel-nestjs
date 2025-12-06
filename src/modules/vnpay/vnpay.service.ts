// src/modules/vnpay/vnpay.service.ts
import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ReturnQueryFromVNPay, VNPay, VNPayConfig } from 'vnpay';
import { VNPAY_MODULE_OPTIONS } from './vnpay.constant';

// ✅ Import clean interfaces
import type {
    QueryDrOptions,
    VNPayRefundOptions,
    BuildPaymentUrlData,
} from './interfaces/method-options.interface';

@Injectable()
export class VnpayService {
    private vnpay: VNPay;

    constructor(
        @Inject(VNPAY_MODULE_OPTIONS)
        private readonly options: VNPayConfig,
    ) {
        try {
            this.vnpay = new VNPay(this.options);
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to initialize VNPay: ${error.message}`
            );
        }
    }

    /**
     * ✅ Build payment URL
     * @param options Payment options
     * @returns Payment URL string
     */
    buildPaymentUrl(options: Partial<BuildPaymentUrlData>): string {
        try {
            return this.vnpay.buildPaymentUrl(options as any);
        } catch (error) {
            throw new BadRequestException(
                `Failed to build payment URL: ${error.message}`
            );
        }
    }

    /**
     * ✅ Verify return URL from VNPay
     * @param query Query parameters from return URL
     * @returns Verification result
     */
    verifyReturnUrl(query: Record<string, any>) {
        try {
            return this.vnpay.verifyReturnUrl(query as unknown as ReturnQueryFromVNPay);
        } catch (error) {
            throw new BadRequestException(
                `Failed to verify return URL: ${error.message}`
            );
        }
    }

    /**
     * ✅ Verify IPN callback from VNPay
     * @param query Query parameters from IPN
     * @returns Verification result
     */
    verifyIpnCall(query: Record<string, any>) {
        try {
            return this.vnpay.verifyIpnCall(query as unknown as ReturnQueryFromVNPay);
        } catch (error) {
            throw new BadRequestException(
                `Failed to verify IPN: ${error.message}`
            );
        }
    }

    /**
     * ✅ Query transaction status (if VNPay SDK supports it)
     * @param options Query options
     */
    async queryTransaction(options: QueryDrOptions) {
        // ❌ Remove if VNPay SDK doesn't have this method
        throw new BadRequestException(
            'Query transaction is not implemented. Please check VNPay SDK documentation.'
        );
    }

    /**
     * ✅ Process refund (if VNPay SDK supports it)
     * @param options Refund options
     */
    async processRefund(options: VNPayRefundOptions) {
        // ❌ Remove if VNPay SDK doesn't have this method
        throw new BadRequestException(
            'Refund is not implemented. Please check VNPay SDK documentation.'
        );
    }

    /**
     * ✅ Get VNPay instance (for advanced usage)
     */
    getVNPayInstance(): VNPay {
        return this.vnpay;
    }
}