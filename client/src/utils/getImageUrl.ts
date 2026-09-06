// src/utils/getImageUrl.ts
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, "")
  : "";

export const getTourImageUrl = (imageName?: string) => {
  if (!imageName) return "/placeholder-tour.jpg"; 
  if (imageName.startsWith("http")) return imageName;

  return `${API_BASE_URL}/img/tours/${imageName}`;
};

export const getUserImageUrl = (imageName?: string) => {
    if (!imageName) return "/placeholder.jpg";
    if (imageName.startsWith("http")) return imageName;
    return `${API_BASE_URL}/img/users/${imageName}`; 
  };