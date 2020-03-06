const path = require('path');

const { fetchApi, imageToBase64 } = require('./client');

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
