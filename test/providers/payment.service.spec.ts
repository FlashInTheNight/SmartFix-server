import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentService } from 'src/payment/payment.service';

describe('Payment Service', () => {
  let app: INestApplication;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    paymentService = testModule.get<PaymentService>(PaymentService);

    app = testModule.createNestApplication();

    await app.init();
  });

  it('should make payment', async () => {
    const data = await paymentService.makePayment({
      amount: 100,
      description: 'заказ №1',
    });

    expect(data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: expect.any(String),
        amount: {
          currency: expect.any(String),
          value: expect.any(String),
        },
        description: expect.anything(),
        recipient: {
          account_id: expect.any(String),
          gateway_id: expect.any(String),
        },
        created_at: expect.any(String),
        confirmation: {
          type: expect.any(String),
          confirmation_url: expect.any(String),
        },
        test: expect.any(Boolean),
        paid: expect.any(Boolean),
        refundable: expect.any(Boolean),
        metadata: expect.any(Object),
      }),
    );
  });
});
