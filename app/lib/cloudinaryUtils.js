export const CLOUD_NAME = "poshax";

export const getImage = (publicId, width = 400) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/${publicId}`;
};

export const getVideo = (publicId) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto,f_auto,vc_auto/${publicId}`;
};