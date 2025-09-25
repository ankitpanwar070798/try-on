"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon, CameraIcon, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { toastUtils } from "@/lib/utils";

interface UserPhoto {
  data: string;
  name: string;
  createdAt: string;
}

const FAL_API_KEY = process.env.NEXT_PUBLIC_FAL_API_KEY || "";

export default function VirtualTryOn() {
  const [userPhoto, setUserPhoto] = useState<UserPhoto | null>(null);
  const [productPhoto, setProductPhoto] = useState<UserPhoto | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isUploadingUser, setIsUploadingUser] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUserPhoto = localStorage.getItem("userPhoto");
    const savedProductPhoto = localStorage.getItem("productPhoto");
    const savedGeneratedImage = localStorage.getItem("generatedImage");

    if (savedUserPhoto) setUserPhoto(JSON.parse(savedUserPhoto));
    if (savedProductPhoto) setProductPhoto(JSON.parse(savedProductPhoto));
    if (savedGeneratedImage) setGeneratedImage(savedGeneratedImage);

    // Welcome toast
    toastUtils.app.welcome();
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const captureFromCamera = async (setPhoto: (p: UserPhoto) => void, key: string) => {
    toastUtils.app.cameraStart();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      await new Promise((resolve) => setTimeout(resolve, 500));
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const base64 = canvas.toDataURL("image/jpeg");
      const photoData: UserPhoto = {
        data: base64,
        name: `${key}-camera.jpg`,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(photoData));
      setPhoto(photoData);
      stream.getTracks().forEach((track) => track.stop());
      toastUtils.app.cameraSuccess();
    } catch {
      toastUtils.app.cameraError();
    }
  };

  const handleUserFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image size should be < 5MB");

    setIsUploadingUser(true);
    toast.info("Uploading your photo...");
    try {
      const base64 = await fileToBase64(file);
      const photoData: UserPhoto = {
        data: base64,
        name: file.name,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("userPhoto", JSON.stringify(photoData));
      setUserPhoto(photoData);
      toast.success("Your photo uploaded successfully!");
    } catch {
      toast.error("Failed to upload photo. Try again.");
    } finally {
      setIsUploadingUser(false);
    }
  };

  const handleProductFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image size should be < 5MB");

    setIsUploadingProduct(true);
    toast.info("Uploading product photo...");
    try {
      const base64 = await fileToBase64(file);
      const photoData: UserPhoto = {
        data: base64,
        name: file.name,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("productPhoto", JSON.stringify(photoData));
      setProductPhoto(photoData);
      toast.success("Product photo uploaded successfully!");
    } catch {
      toast.error("Failed to upload product photo. Try again.");
    } finally {
      setIsUploadingProduct(false);
    }
  };

  const handleRemoveUserPhoto = () => {
    localStorage.removeItem("userPhoto");
    setUserPhoto(null);
    toast.success("Your photo removed successfully");
  };

  const handleRemoveProductPhoto = () => {
    localStorage.removeItem("productPhoto");
    setProductPhoto(null);
    toast.success("Product photo removed successfully");
  };

const handleGenerateTryOn = async () => {
  if (!userPhoto || !productPhoto) return toast.error("Please upload both photos");
  if (!FAL_API_KEY) return toast.error("Missing Fal API key in .env");

  setIsGenerating(true);
  setGeneratedImage(null);

  toast.info("Starting AI try-on generation...", { duration: 3000 });

  try {
    const submitResponse = await fetch("https://queue.fal.run/fal-ai/nano-banana/edit", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt:
          "prompt: Professional fashion photography: Seamlessly blend the clothing item from the second image onto the person in the first image. Maintain the person's natural body pose, facial features, skin tone, and original background. Ensure realistic fabric draping, proper fit, and natural lighting. The result should look like a high-quality product photo shoot.",
        image_urls: [userPhoto.data, productPhoto.data],
        num_images: 1,
        output_format: "jpeg",
      }),
    });

    if (!submitResponse.ok) throw new Error("Failed to submit request");

    const { request_id } = await submitResponse.json();
    toast.info("Request submitted. Processing your try-on...");

    let status;
    let retries = 0;
    do {
      await new Promise((res) => setTimeout(res, 5000));
      retries++;
      if (retries > 20) throw new Error("Try-on request timed out");

      const statusResponse = await fetch(
        `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}/status`,
        { headers: { Authorization: `Key ${FAL_API_KEY}` } }
      );
      status = await statusResponse.json();

    } while (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS");

    if (status.status === "FAILED") throw new Error("Try-on failed on server");

    const resultResponse = await fetch(
      `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}`,
      { headers: { Authorization: `Key ${FAL_API_KEY}` } }
    );
    const result = await resultResponse.json();

    if (result?.images?.length) {
      setGeneratedImage(result.images[0].url);
      localStorage.setItem("generatedImage", result.images[0].url);
      toast.success("Virtual try-on generated successfully! 🎉");
    } else throw new Error("No image generated");

  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to generate try-on");
  } finally {
    setIsGenerating(false);
  }
};

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `virtual-try-on-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Image downloaded successfully! 📥");
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        // For Web Share API, we need to convert the image to a File
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], `virtual-try-on-${Date.now()}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'Virtual Try-On Result',
          text: 'Check out my virtual try-on result!',
          files: [file]
        });
        
        toast.success("Shared successfully! 🚀");
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(generatedImage);
        toast.success("Image link copied to clipboard! 📋");
      }
    } catch (err) {
      // If sharing fails, try copying to clipboard as fallback
      try {
        await navigator.clipboard.writeText(generatedImage);
        toast.success("Image link copied to clipboard! 📋");
      } catch {
        toast.error("Unable to share. Please try downloading instead.");
      }
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 " style={{
      background: "#ffffff",
      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
      backgroundSize: "20px 20px",
    }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--foreground)]">Virtual Try-On</h1>
          <p className="text-sm md:text-base text-slate-500">Upload your photo and a product image. Keep it simple, see results fast.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Photo Card */}
          <Card className="surface rounded-xl bg-teal-100">
            <CardHeader>
              <CardTitle className="text-lg">Your Photo</CardTitle>
              <CardDescription>Upload or capture a photo of yourself</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {userPhoto ? (
                <div className="relative">
                  <Image src={userPhoto.data} alt={userPhoto.name} width={256} height={256} className="rounded-lg object-cover" />
                  <Button onClick={handleRemoveUserPhoto} size="sm" variant="destructive" className="absolute top-2 right-2 bg-red-500">
                    <Trash2Icon className="w-4 h-4 " />
                  </Button>
                </div>
              ) : (
                <div className="w-full border border-dashed rounded-lg p-6 text-center bg-white">
                  <ImageIcon size={36} className="text-slate-400 mx-auto" />
                  <p className="text-slate-500 text-sm mt-2">No photo yet</p>
                </div>
              )}

              <div className="flex gap-2 w-full justify-center">
                <Input
                  id="user-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUserFileUpload}
                  className="hidden"
                />
                <Button asChild variant={userPhoto ? "outline" : "default"} className="cursor-pointer flex-1 bg-gray-800 border border-gray-300 text-gray-100 hover:bg-gray-700 transition-colors">
                  <Label htmlFor="user-file-upload" className=" flex items-center gap-2">
                    {isUploadingUser ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                    {isUploadingUser ? "Uploading..." : "Upload"}
                  </Label>
                </Button>
                <Button onClick={() => captureFromCamera(setUserPhoto, "userPhoto")} variant="secondary" className="cursor-pointer flex-1 bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 transition-colors">
                  <CameraIcon className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Photo Card */}
          <Card className="surface rounded-xl bg-amber-100">
            <CardHeader>
              <CardTitle className="text-lg">Product Photo</CardTitle>
              <CardDescription>Upload or capture the clothing item</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {productPhoto ? (
                <div className="relative">
                  <Image src={productPhoto.data} alt={productPhoto.name} width={256} height={256} className="rounded-lg object-cover" />
                  <Button onClick={handleRemoveProductPhoto} size="sm" variant="destructive" className="absolute top-2 right-2 bg-red-500">
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-full border border-dashed rounded-lg p-6 text-center bg-white">
                  <ImageIcon size={36} className="text-slate-400 mx-auto" />
                  <p className="text-slate-500 text-sm mt-2">No product photo yet</p>
                </div>
              )}

              <div className="flex gap-2 w-full justify-center">
                <Input
                  id="product-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProductFileUpload}
                  className="hidden"
                />
                <Button asChild variant={productPhoto ? "outline" : "default"} className="cursor-pointer flex-1 bg-gray-800 border border-gray-300 text-gray-100 hover:bg-gray-700 transition-colors">
                  <Label htmlFor="product-file-upload" className="flex items-center gap-2">
                    {isUploadingProduct ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                    {isUploadingProduct ? "Uploading..." : "Upload"}
                  </Label>
                </Button>
                <Button onClick={() => captureFromCamera(setProductPhoto, "productPhoto")} variant="secondary" className="cursor-pointer flex-1 bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 transition-colors">
                  <CameraIcon className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button onClick={handleGenerateTryOn} disabled={!userPhoto || !productPhoto || isGenerating} size="lg" className="cursor-pointer sm:w-2xs w-full  px-6 bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 transition-colors">
            {isGenerating ? <><Loader2Icon className="w-5 h-5 animate-spin mr-2" /> Generating...</> : "Generate Virtual Try-On"}
          </Button>
        </div>

        {/* Result Card */}
        {generatedImage && (
          <Card className="surface rounded-xl max-w-xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Result</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  <Button
                    onClick={handleShare}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Image src={generatedImage} alt="Virtual try-on result" width={320} height={320} className="rounded-lg" />
            </CardContent>
          </Card>
        )}

        {/* Hidden video element */}
        <video ref={videoRef} className="hidden" />
      </div>
    </div>
  );
}
