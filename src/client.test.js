const path = require('path');

const { fetchApi, imageToBase64 } = require('./client');

describe('invites', () => {
  test('invites unauthorized', async () => {
    const { errors } = await fetchApi('/invites', {
      apiKey: 'jsdkldjfdsljd'
    });
    expect(errors).toMatchObject([
      { type: 'InvalidRequestError', message: 'Account not found.' }
    ]);
  });
  test('crosscheck', async () => {
    const r = await fetchApi('/identity/crosscheck', {
      body: {
        firstName: 'John',
        lastName: 'Bao',
        email: 'baoman@mail.com',
        phone: '917-343-3433',
        ipAddress: '73.19.102.110',
        address: {
          streetAddress: '1 Main St',
          city: 'Seattle',
          postalCode: '98031',
          state: 'WA',
          country: 'US'
        }
      }
    });
    expect(!!r.id).toBe(true);
    expect(r.result.phone.isMatch).toBe(false);
    expect(r.result.email.isValid).toBe(true);
    expect(r.result.address.isValid).toBe(true);
    expect(r.result.confidences.identity).toBeLessThan(0.39);
  });
  test('crosscheck errors', async () => {
    const r = await fetchApi('/identity/crosscheck', {
      body: {
        firstName: 'David',
        lastName: 'Smith',
        email: 'baoman@mail.com',
        phone: '917-343-3433',
        ipAddress: '73.19.102.110',
        address: {
          streetAddress: '1 Main St',
          city: 'Seattle',
          postalCode: '98031',
          state: 'WA',
          country: 'US'
        }
      }
    });
    //console.log(JSON.stringify(r,null,4))
    expect(!!r.id).toBe(true);
    expect(r.result.address.errors[0].type).toBe("NameMatchError")
    expect(r.result.phone.errors[0].type).toBe("NameMatchError")
  });
  test('crosscheck errors', async () => {
    const r = await fetchApi('/identity/crosscheck', {
      body: {
        firstName: 'Jon',
        lastName: 'Doe',
        email: 'baoman@mail.com',
        phone: '917-343-3433',
        ipAddress: '73.19.102.110',
        address: {
          streetAddress: '1 Main St',
          city: 'Seattle',
          postalCode: '98031',
          state: 'WA',
          country: 'US'
        }
      }
    });
    //console.log(JSON.stringify(r,null,4))
    expect(!!r.id).toBe(true);
    expect(r.result.address.warnings[2].type).toBe("NameMatchError")
    expect(r.result.address.warnings[2].suggestion).toBe("John Doe")
    expect(r.result.phone.errors[0].type).toBe("NameMatchError")
  });  
  test('all invites', async () => {
    const { total, page, pageSize, items } = await fetchApi(
      '/invites?pageSize=3&id=mKAUux8h_',
      {}
    );
    expect(total).toBeGreaterThan(-1);
    expect(pageSize).toBeGreaterThan(-1);
    expect(page).toBeGreaterThan(-1);
    expect(items.length).toBeGreaterThan(-1);
  });

  test('create invite bad number', async () => {
    const email = 'darwin66@lkxloans.com';
    const r = await fetchApi('/invites', {
      body: {
        email,
        firstName: 'John',
        lastName: 'Bao',
        phone: '0000000000',
        contact: 'phone'
      }
    });
    expect(r.errors).toMatchObject([
      {
        message: "The 'To' number +10000000000 is not a valid phone number.",
        type: 'InvalidRequestError'
      }
    ]);
  });
  test('create invite with props', async () => {
    const email = 'darwin66@lkxloans.com';
    const r = await fetchApi('/invites', {
      body: {
        email,
        firstName: 'John',
        lastName: 'Bao',
        phone: '0004007007',
        contact: 'email', // phone
        enableIPAddress: false,
        enablePhysicalAddress: false,
        enableDarkWeb: false,
        enableCrossCheck: false,
        enableAAMVA: false
      }
    });
    expect(r).toMatchObject({
      send: true,
      email,
      firstName: 'John',
      lastName: 'Bao',
      phone: '+10004007007',
      contact: 'email'
    });
  });  
  test('create invite success', async () => {
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
      send: true,
      email,
      firstName: 'John',
      lastName: 'Bao',
      phone: '+10004007007',
      contact: 'email'
    });
  });
  test('create invite no send', async () => {
    const email = 'darwin66@lkxloans.com';
    const r = await fetchApi('/invites', {
      body: {
        email,
        send: false,
        firstName: 'John',
        lastName: 'Bao',
        phone: '0004007007',
        contact: 'email' // phone
      }
    });
    expect(r).toMatchObject({
      send: false,
      email,
      firstName: 'John',
      lastName: 'Bao',
      phone: '+10004007007',
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
describe('identity documents', () => {
  test('id documents', async () => {
    const r = await fetchApi('/identity/documents', {});

    expect(r.documents.length > 0).toBe(true);
  });
});
describe('jobs download', () => {
  test('download confidences false', async () => {
    const { errors } = await fetchApi(
      `/jobs/232/download?confidences=false`,
      {}
    );
    expect(errors).toMatchObject([
      { message: 'job: 232 not found', type: 'InvalidRequestError' }
    ]);
  });
  test('download default', async () => {
    const { errors } = await fetchApi(`/jobs/232/download`, {});
    expect(errors).toMatchObject([
      { message: 'job: 232 not found', type: 'InvalidRequestError' }
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
    const r = await fetchApi(
      '/jobs?status=completed&ids=["Ep58Ck47","djskjfks"]&from=2011-10-05T14:48:00.000Z&withPhotoUrls=true',
      {}
    );

    const { total, page, pageSize, items } = r;
    expect(total).toBeGreaterThan(-1);
    expect(pageSize).toBeGreaterThan(-1);
    expect(page).toBeGreaterThan(-1);
    expect(items.length).toBeGreaterThan(-1);
  });
  test(
    'job authenticate',
    async () => {
      const userPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-sunglasses.jpg'
      );
      const body = {
        id: 'sSCQiznqX',
        userPhoto
      };
      const r = await fetchApi('/identity/authenticate', {
        body,
        method: 'POST'
      });
    },
    30 * 1000
  );
  test(
    'job submit face only',
    async () => {
      const userPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-sunglasses.jpg'
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
          userPhoto
        }
      };
      const job = await fetchApi('/jobs', { body, method: 'POST' });
      expect(job.surveyPoll).toBe(null);
      expect(job.surveyMessage).toBe(null);
      expect(job.surveyAt).toBe(null);
      expect(job.status).toBe('completed');
    },
    30 * 1000
  );
  test(
    'job submit id',
    async () => {
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
          idPhoto
        }
      };
      const job = await fetchApi('/jobs', { body, method: 'POST' });
      expect(job.surveyPoll).toBe(null);
      expect(job.surveyMessage).toBe(null);
      expect(job.surveyAt).toBe(null);
      expect(job.status).toBe('completed');
    },
    30 * 1000
  );
  test(
    'job submit sunglasses',
    async () => {
      const userPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-sunglasses.jpg'
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
      expect(job.result.confidences.selfieSunglasses).toBeGreaterThan(0.97);
      expect(job.surveyPoll).toBe(null);
      expect(job.surveyMessage).toBe(null);
      expect(job.surveyAt).toBe(null);
      expect(job.result.confidences.faceMatch).toBeLessThan(0.85);
      expect(job.status).toBe('completed');
    },
    30 * 1000
  );
  test(
    'job submit no data',
    async () => {
      const userPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-face.png'
      );
      const idPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-id.png'
      );
      const body = {
        type: 'id-verification',
        params: {}
      };
      const job = await fetchApi('/jobs', { body, method: 'POST' });
      expect(job.result.confidences).toBe(null);
      expect(job.status).toBe('completed');
    },
    20 * 1000
  );
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
          dob: '06/22/1970',
          userPhoto,
          idPhoto
        }
      };
      const job = await fetchApi('/jobs', { body, method: 'POST' });
      expect(job.result.confidences.selfieSunglasses).toBe(0);
      expect(job.result.confidences.id).toBeLessThan(0.85);
      expect(job.result.confidences.birthDateMatch).toBeGreaterThan(0.9);
      expect(job.result.success).toBe(false);
      expect(job.result.successWithSuggestion).toBe(false);
      expect(job.errors.length > 0).toBe(true);
      expect(job.result.confidences.faceMatch).toBeGreaterThan(0.9);
      expect(job.status).toBe('completed');
    },
    30 * 1000
  );
  test(
    'job review',
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
          dob: '06/22/1970',
          userPhoto,
          idPhoto
        }
      };
      // create job
      let job = await fetchApi('/jobs', { body, method: 'POST' });
      // submit a review override
      const review = {
        idValid: true,
        selfieValid: false,
        faceMatch: null,
        nameMatch: true,
        birthDateMatch: false,
        firstName: 'New',
        lastName: 'Name',
        docId: '344454',
        idType: null,
        birthDate: '01/01/1980',
        expireDate: '01/02/2025',
        state: 'WA',
        country: 'US'
      };
      job = await fetchApi(`/jobs/${job.id}/review`, {
        body: review,
        method: 'PUT'
      });

      expect(job.review.firstName).toBe('New');
      expect(job.review.selfieValid).toBe(false);
      expect(job.review.state).toBe('WA');
      job = await fetchApi(`/jobs/${job.id}/review`, {
        body: { ...review, idType: 'no-id' },
        method: 'PUT'
      });
      expect(job.errors).toMatchObject([
        {
          type: 'InvalidRequestError',
          message: 'Invalid id type'
        }
      ]);
      job = await fetchApi(`/jobs/${job.id}/review`, {
        body: { ...review, state: 'ZZ' },
        method: 'PUT'
      });
      expect(job.errors).toMatchObject([
        {
          type: 'InvalidRequestError',
          message: 'Invalid state'
        }
      ]);
      job = await fetchApi(`/jobs/${job.id}/review`, {
        body: { ...review, country: '00' },
        method: 'PUT'
      });
      expect(job.errors).toMatchObject([
        {
          type: 'InvalidRequestError',
          message: 'Invalid country'
        }
      ]);
    },
    30 * 1000
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
  // other method since some clients don't have deletes
  test('jobs delete not found', async () => {
    const { errors } = await fetchApi('/jobs/232/remove', { method: 'POST' });
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

describe('aamva tests', () => {
  test('aamva standalone job test', async () => {
    const aamvaRequest = {
      licenseNumber: '520AS4197',
      country: 'US',
      lastName: 'Bao',
      idType: 'drivers-license',
      state: 'IA',
      dob: '05/29/1990',
      issueDate: '05/29/2020',
      expirationDate: '05/29/2025'
    };
    const r = await fetchApi('/identity/aamva', {
      body: aamvaRequest
    });

    const returnRequestObject = r.request;
    expect(returnRequestObject).toMatchObject(aamvaRequest);
    expect(r.result.aamva_status).toBe('Pending');
    expect(r.result.job_status).toBe('active');
    expect(r.result.job_type).toBe('id-aamva');
  });

  test(
    'job submit with crosscheck and darkweb enabled',
    async () => {
      const userPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-face.png'
      );
      const idPhoto = await imageToBase64(
        path.dirname(__filename) + '/../data/test-id.png'
      );
      const body = {
        type: 'id-verification',
        params: {
          firstName: 'John',
          lastName: 'Bao',
          dob: '06/22/1970',
          userPhoto,
          idPhoto,
          enableCrossCheck: true,
          enableDarkWeb: true,
          enableIPAddress: false,
          enablePhysicalAddress: false,
          enableAAMVA: false
        }
      };
      const job = await fetchApi('/jobs', { body, method: 'POST' });
      expect(job.result.featuresEnabled.idvEnabled).toBe(true);
      expect(job.result.featuresEnabled.idvBillable).toBe(true);
      expect(job.result.featuresEnabled.crosscheckEnabled).toBe(true);
      expect(job.result.featuresEnabled.crosscheckBillable).toBe(true);
      expect(job.result.featuresEnabled.darkwebEnabled).toBe(true);
      expect(job.result.featuresEnabled.darkwebBillable).toBe(true);
      expect(job.result.featuresEnabled.ipAddressEnabled).toBe(false);
      expect(job.result.featuresEnabled.ipAddressEnabled).toBe(false);
      expect(job.result.featuresEnabled.ipAddressBillable).toBe(false);
      expect(job.result.featuresEnabled.physicalAddressBillable).toBe(false);
      expect(job.result.featuresEnabled.aamvaEnabled).toBe(false);
      expect(job.result.featuresEnabled.aamvaBillable).toBe(false);
    },
    30 * 1000
  );
});
