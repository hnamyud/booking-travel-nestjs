// src/common/date.service.ts
import { Injectable } from '@nestjs/common';
import { toZonedTime, format } from 'date-fns-tz';

@Injectable()
export class DateService {
  private readonly VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
  private readonly DEFAULT_FORMAT = 'yyyy-MM-dd HH:mm:ss';

  /**
   * Lấy thời gian hiện tại ở Việt Nam.
   * @returns {Date} Một đối tượng Date đã được chuẩn hóa.
   */
  getCurrentVietnamTime(): Date {
    const nowUtc = new Date();
    return toZonedTime(nowUtc, this.VIETNAM_TIMEZONE);
  }

  /**
   * Chuyển đổi một đối tượng Date (thường là từ DB, mặc định là UTC) sang giờ Việt Nam.
   * @param date - Đối tượng Date (ví dụ: từ new Date() hoặc database).
   * @returns {Date} Đối tượng Date ở múi giờ Việt Nam.
   */
  convertToVietnamTime(date: Date): Date {
    return toZonedTime(date, this.VIETNAM_TIMEZONE);
  }

  /**
   * Định dạng một đối tượng Date thành chuỗi theo giờ Việt Nam.
   * @param date - Đối tượng Date cần định dạng.
   * @param formatString - Chuỗi định dạng (ví dụ: 'dd/MM/yyyy').
   * @returns {string} Chuỗi thời gian đã định dạng.
   */
  formatInVietnamTime(date: Date, formatString: string = this.DEFAULT_FORMAT): string {
    return format(date, formatString, { timeZone: this.VIETNAM_TIMEZONE });
  }
}