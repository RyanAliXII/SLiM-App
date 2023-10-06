export const BUCKET = "sti.munoz.edsa.library";
export const S3_URL = import.meta.env.VITE_S3_URL;
export const buildS3Url = (s3key: string) => {
  return `${S3_URL}/${BUCKET}/${s3key}`;
};
