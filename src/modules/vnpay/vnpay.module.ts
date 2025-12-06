// src/modules/vnpay/vnpay.module.ts
import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VnpayService } from './vnpay.service';
import { VnpayController } from './vnpay.controller';
import { VNPAY_MODULE_OPTIONS } from './vnpay.constant';

import type {
    VnpayModuleOptions,
    VnpayModuleAsyncOptions,
    VnpayModuleOptionsFactory,
} from './interfaces';

@Global() // ✅ Make VnpayService available globally
@Module({})
export class VnpayModule {
    /**
     * ✅ Synchronous configuration
     */
    static register(options: VnpayModuleOptions): DynamicModule {
        return {
            module: VnpayModule,
            controllers: [VnpayController],
            providers: [
                {
                    provide: VNPAY_MODULE_OPTIONS,
                    useValue: options,
                },
                VnpayService,
            ],
            exports: [VnpayService],
        };
    }

    /**
     * ✅ Asynchronous configuration
     */
    static registerAsync(options: VnpayModuleAsyncOptions): DynamicModule {
        return {
            module: VnpayModule,
            imports: options.imports || [],
            controllers: [VnpayController],
            providers: [
                ...this.createAsyncProviders(options),
                VnpayService,
            ],
            exports: [VnpayService],
        };
    }

    /**
     * ✅ Create async providers
     */
    private static createAsyncProviders(
        options: VnpayModuleAsyncOptions,
    ): Provider[] {
        if (options.useFactory) {
            return [
                {
                    provide: VNPAY_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
            ];
        }

        const optionsProvider: Provider = options.useClass
            ? {
                provide: options.useClass,
                useClass: options.useClass,
            }
            : {
                provide: options.useExisting!,
                useExisting: options.useExisting,
            };

        return [
            {
                provide: VNPAY_MODULE_OPTIONS,
                useFactory: async (optionsFactory: VnpayModuleOptionsFactory) =>
                    optionsFactory.createVnpayOptions(),
                inject: [options.useExisting || options.useClass],
            },
            optionsProvider,
        ];
    }
}