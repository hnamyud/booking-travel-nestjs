// src/modules/vnpay/interfaces/method-options.interface.ts
import type {
    BuildPaymentUrlLogger,
    VNPay,
    VerifyIpnCallLogger,
    VerifyReturnUrlLogger,
    BuildPaymentUrlOptions as _BuildPaymentUrlOptions,
    VerifyIpnCallOptions as _VerifyIpnCallOptions,
    VerifyReturnUrlOptions as _VerifyReturnUrlOptions,
} from 'vnpay';

// ✅ Single Logger interface for all logging needs
export interface Logger {
    info?: (message: string, ...args: any[]) => void;
    error?: (message: string, ...args: any[]) => void;
    warn?: (message: string, ...args: any[]) => void;
    debug?: (message: string, ...args: any[]) => void;
}

// ✅ Query transaction options
export interface QueryDrOptions {
    /** Mã đơn hàng */
    orderId: string;
    /** Ngày giao dịch (yyyyMMddHHmmss) */
    transDate: string;
    /** Địa chỉ IP */
    ipAddr?: string;
    /** Logger instance */
    logger?: Partial<Logger>;
}

// ✅ Refund options (renamed để tránh conflict)
export interface VNPayRefundOptions {
    /** Mã đơn hàng gốc */
    orderId: string;
    /** Số tiền hoàn (VND) */
    amount: number;
    /** Thông tin đơn hàng */
    orderInfo: string;
    /** Mã giao dịch VNPay */
    transactionNo: string;
    /** Ngày giao dịch (yyyyMMddHHmmss) */
    transDate: string;
    /** Người tạo yêu cầu hoàn tiền */
    createBy: string;
    /** Địa chỉ IP */
    ipAddr?: string;
    /** Logger instance */
    logger?: Partial<Logger>;
}

export type BuildPaymentUrlData = Parameters<VNPay['buildPaymentUrl']>[0];

// ✅ Main VNPay interface exports
export interface BuildPaymentUrlOptions
    extends _BuildPaymentUrlOptions<keyof BuildPaymentUrlLogger> {}

export interface VerifyReturnUrlOptions
    extends _VerifyReturnUrlOptions<keyof VerifyReturnUrlLogger> {}

export interface VerifyIpnCallOptions
    extends _VerifyIpnCallOptions<keyof VerifyIpnCallLogger> {}