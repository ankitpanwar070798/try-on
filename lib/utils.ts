import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toast utility functions for consistent messaging across the app
export const toastUtils = {
  // Success toasts
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  },

  // Error toasts
  error: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
    })
  },

  // Info toasts
  info: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
    })
  },

  // Warning toasts
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    })
  },

  // Loading toast with promise
  loading: (message: string, promise: Promise<unknown>) => {
    return toast.promise(promise, {
      loading: message,
      success: () => "Operation completed successfully!",
      error: (err) => err?.message || "Operation failed",
    })
  },

  // Custom toast with action
  custom: (message: string, options?: { 
    action?: { label: string; onClick: () => void }; 
    description?: string;
    duration?: number;
  }) => {
    return toast(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  // Dismiss all toasts
  dismiss: () => toast.dismiss(),

  // Common application-specific toasts
  app: {
    welcome: () => {
      if (typeof window !== 'undefined') {
        if (sessionStorage.getItem('welcomeToastShown')) return;
        sessionStorage.setItem('welcomeToastShown', '1');
      }
      toastUtils.success("Welcome to Virtual Try-On!", {
        description: "Upload your photo and a product image to get started."
      });
    },
    
    uploadStart: (type: "user" | "product") => 
      toastUtils.info(`Uploading ${type === "user" ? "your" : "product"} photo...`),
    
    uploadSuccess: (type: "user" | "product") => 
      toastUtils.success(`${type === "user" ? "Your" : "Product"} photo uploaded successfully!`),
    
    uploadError: (type: "user" | "product") => 
      toastUtils.error(`Failed to upload ${type === "user" ? "your" : "product"} photo. Please try again.`),
    
    cameraStart: () => toastUtils.info("Opening camera..."),
    
    cameraSuccess: () => toastUtils.success("Photo captured successfully!"),
    
    cameraError: () => toastUtils.error("Unable to access camera. Please check permissions."),
    
    removeSuccess: (type: "user" | "product") => 
      toastUtils.success(`${type === "user" ? "Your" : "Product"} photo removed successfully`),
    
    generationStart: () => toastUtils.info("Starting AI try-on generation..."),
    
    generationProgress: () => toastUtils.info("AI is working on your try-on..."),
    
    generationSuccess: () => toastUtils.success("Virtual try-on generated successfully! 🎉", {
      description: "Your AI-powered try-on is ready!"
    }),
    
    generationError: (error?: string) => toastUtils.error(error || "Failed to generate try-on", {
      description: "Please try again or check your internet connection."
    }),
    
    missingPhotos: () => toastUtils.error("Please upload both photos", {
      description: "You need both your photo and a product photo to continue."
    }),
    
    missingApiKey: () => toastUtils.error("Missing API key", {
      description: "Please configure the FAL API key in your environment variables."
    }),
    
    invalidFile: () => toastUtils.error("Please select an image file", {
      description: "Only image files (JPG, PNG, etc.) are supported."
    }),
    
    fileTooLarge: () => toastUtils.error("Image size should be less than 5MB", {
      description: "Please compress your image or choose a smaller file."
    }),
  }
}