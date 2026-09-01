import { RegistrationService } from './registration.service';

describe('RegistrationService allotment delivery tracking', () => {
  const model = {
    findOneAndUpdate: jest.fn(),
    exists: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
  };
  const emailService = {
    sendAllotmentEmail: jest.fn(),
  };
  const sheetsService = {};

  const createService = () =>
    new RegistrationService(
      model as never,
      emailService as never,
      sheetsService as never,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks only genuinely changed allotments as updated', async () => {
    model.findOneAndUpdate.mockResolvedValue({ registrationId: 'RJMUN1' });

    const result = await createService().bulkUpdateAllotments([
      {
        registrationId: 'RJMUN1',
        allottedCommittee: 'UNHRC',
        allottedPortfolio: 'India',
      },
    ]);

    expect(result).toEqual({ updated: 1, unchanged: 0, failed: [] });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationId: 'RJMUN1',
        $or: expect.any(Array),
      }),
      expect.objectContaining({ isAllotmentUpdated: true }),
      { new: true },
    );
    expect(model.exists).not.toHaveBeenCalled();
  });

  it('does not requeue an unchanged allotment for email', async () => {
    model.findOneAndUpdate.mockResolvedValue(null);
    model.exists.mockResolvedValue({ _id: 'existing-id' });

    const result = await createService().bulkUpdateAllotments([
      {
        registrationId: 'RJMUN2',
        allottedCommittee: 'UNSC',
        allottedPortfolio: 'France',
      },
    ]);

    expect(result).toEqual({ updated: 0, unchanged: 1, failed: [] });
  });

  it('reports a missing registration as failed', async () => {
    model.findOneAndUpdate.mockResolvedValue(null);
    model.exists.mockResolvedValue(null);

    const result = await createService().bulkUpdateAllotments([
      {
        registrationId: 'MISSING',
        allottedCommittee: 'WHO',
        allottedPortfolio: 'Japan',
      },
    ]);

    expect(result).toEqual({
      updated: 0,
      unchanged: 0,
      failed: ['MISSING'],
    });
  });

  it('clears each successful email flag immediately', async () => {
    model.find.mockResolvedValue([
      {
        _id: 'mongo-id',
        registrationId: 'RJMUN3',
        email: 'delegate@example.com',
        fullName: 'Test Delegate',
        allottedCommittee: 'UNHRC',
        allottedPortfolio: 'India',
      },
    ]);
    emailService.sendAllotmentEmail.mockResolvedValue({ provider: 'gmail' });
    model.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await createService().sendAllotmentEmails();

    expect(result).toEqual({ sent: 1, failed: [] });
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'mongo-id' },
      { $set: { isAllotmentUpdated: false } },
    );
  });
});
