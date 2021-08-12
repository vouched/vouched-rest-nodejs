const fetch = require('node-fetch');
const mime = require('mime-types');
const fs = require('fs');
const sharp = require('sharp');
const config = require('./config');

const MAX_RESOLUTION = 2048;
const ValidMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

export const toImageBuffer = async (buffer, mimeType) => {
  if (!ValidMimeTypes.find(v => v === mimeType)) {
    throw new Error(`Unsupported image:${mimeType}`);
  }
  return sharp(buffer, { failOnError: true });
};
export const toMimeType = file => mime.lookup(file);

export const toImage = async imageFile => {
  if (!fs.existsSync(imageFile)) {
    throw new Error(`${imageFile} does not exist.`);
  }
  const mimeType = toMimeType(imageFile);
  return toImageBuffer(imageFile, mimeType);
};
const resizeImageRatio = async (image, info, ratio) => {
  const width = Math.round(info.width * ratio);
  const height = Math.round(info.height * ratio);
  await image.resize(width, height);
  return image;
};

export const resizeImage = async (image, max = null, min = null) => {
  const info = image;
  if (info.width > max || info.height > max) {
    const ratio =
      info.width > info.height ? max / info.width : max / info.height;
    image = await resizeImageRatio(image, info, ratio);
  }

  if (min && (info.width < min || info.height < min)) {
    const ratio =
      info.width < info.height ? min / info.width : min / info.height;

    image = await resizeImageRatio(image, info, ratio);
  }
  return image;
};

const toImageFromBufferPath = async ({
  path,
  buffer = null,
  mimetype = null
}) => {
  if (!mimetype && path) {
    mimetype = toMimeType(path);
  }
  if (!mimetype) throw new Error('Mimetype not found');

  let image = path
    ? await toImage(path)
    : await toImageBuffer(buffer, mimetype);
  return resizeImage(image, MAX_RESOLUTION);
};

export const imageToBase64 = async path => {
  let file = null;
  try {
    const image = await toImageFromBufferPath({ path });
    const bitmap = await image.toBuffer();
    return new Buffer(bitmap).toString('base64');
  } finally {
    if (file) {
      file.removeCallback();
    }
  }
};

export const fetchApi = (
  path,
  { body = null, method = null, apiKey = config.API_PRIVATE_KEY } = {}
) => {
  const url = `${config.API_URL}${path}`;
  // console.log(method);
  if (!method) {
    method = body ? 'POST' : 'GET';
  }
  // console.log(method);
  return fetch(url, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey
    }
  }).then(res => res.json());
};

export const fetchGraphQl = (
  { body = null, method = null, apiKey = config.API_PUBLIC_KEY } = {}
) => {
  const url = `${config.API_GRAPHQL_URL}`;
  if (!method) {
    method = body ? 'POST' : 'GET';
  }
  // console.log(method);
  return fetch(url, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: {
      'Content-Type': 'application/json',
      'x-api-id': apiKey
    }
  }).then(res => res.json());
};
