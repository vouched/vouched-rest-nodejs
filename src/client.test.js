const path = require('path');

const { fetchApi, imageToBase64 } = require('./client');

describe('invites', () => {
  test('invites unauthorized', async () => {
    const { errors } = await fetchApi('/invites', {
      apiKey: 'jsdkldjfdsljd'
    });
    expect(errors).toMatchObject([
      { type: 'AuthenticationError', message: 'Unauthorized access' }
    ]);
  });
  test('invites', async () => {
    const r = await fetchApi('/invites?pageSize=3&page=3', {});
    const { total, page, pageSize, items } = await fetchApi('/invites', {});
    expect(total).toBeGreaterThan(-1);
    expect(pageSize).toBeGreaterThan(-1);
    expect(page).toBeGreaterThan(-1);
    expect(items.length).toBeGreaterThan(-1);
  });
  test('create invite', async () => {
    const email = 'darwin66@lkxloans.com';
    const r = await fetchApi('/invites', {
      body: {
        email,
        firstName: 'John',
        lastName: 'Bao',
        phone: '0004007007',
        contact: 'email' // phone
      }
    });
    expect(r).toMatchObject({
      email,
      firstName: 'John',
      lastName: 'Bao',
      phone: '10004007007',
      contact: 'email'
    });
  });
  test('resend invite', async () => {
    const { errors } = await fetchApi('/invites/sjfkjfd/resend', {
      method: 'POST'
    });
    expect(errors).toMatchObject([
      { message: 'Could not find sms:sjfkjfd', type: 'NotFoundError' }
    ]);
  });
});
describe('jobs', () => {
  test('jobs list no params', async () => {
    const { total, page, pageSize, items } = await fetchApi('/jobs', {});
    expect(total).toBeGreaterThan(-1);
    expect(pageSize).toBeGreaterThan(-1);
    expect(page).toBeGreaterThan(-1);
    expect(items.length).toBeGreaterThan(-1);
  });
  test('jobs list params', async () => {
    const { total, page, pageSize, items } = await fetchApi(
      '/jobs?status=completed&ids=["Ep58Ck47","djskjfks"]&from=2011-10-05T14:48:00.000Z',
      {}
    );
    expect(total).toBeGreaterThan(-1);
    expect(pageSize).toBeGreaterThan(-1);
    expect(page).toBeGreaterThan(-1);
    expect(items.length).toBeGreaterThan(-1);
  });
  test(
    'job submit',
    async () => {
      const userPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-face.png'
      );
      const idPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-id.png'
      );
      const body = {
        type: 'id-verification',
        properties: [
          {
            name: 'internal_id',
            value: 'sdjklfd'
          }
        ],
        params: {
          firstName: 'John',
          lastName: 'Bao',
          dob: '02/11/1995',
          userPhoto,
          idPhoto
        }
      };
      const job = await fetchApi('/jobs', { body, method: 'POST' });
      expect(job.status).toBe('completed');
    },
    20 * 1000
  );
  test('jobs unauthentication', async () => {
    const { errors } = await fetchApi('/jobs?id=232', {
      apiKey: 'jsdkldjfdsljd'
    });
    expect(errors).toMatchObject([
      { type: 'AuthenticationError', message: 'Unauthorized access' }
    ]);
  });
  test('jobs delete not found', async () => {
    const { errors } = await fetchApi('/jobs/232', { method: 'DELETE' });
    expect(errors).toMatchObject([
      { message: 'job: 232 not found', type: 'InvalidRequestError' }
    ]);
  });
  test('jobs not found', async () => {
    const { errors } = await fetchApi('/jobs/232', {});
    expect(errors).toMatchObject([
      { message: 'Could not find job: 232', type: 'NotFoundError' }
    ]);
  });
});
