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
import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon, CameraIcon, Download, Share2, Maximize2, X } from "lucide-react";
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
  // Support multiple images for 'multiple' view
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // for backward compatibility
  const [isUploadingUser, setIsUploadingUser] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // User preferences for better output
  const [gender, setGender] = useState<"male" | "female" | "unisex">("male");
  const [garmentCategory, setGarmentCategory] = useState<"top" | "bottom" | "dress" | "undergarment">("top");
  const [fitPreference, setFitPreference] = useState<"tight" | "regular" | "loose">("regular");
  const [preserveBackground, setPreserveBackground] = useState(true);
  const [viewAngle, setViewAngle] = useState<"front" | "back" | "multiple">("front");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUserPhoto = localStorage.getItem("userPhoto");
    const savedProductPhoto = localStorage.getItem("productPhoto");
    const savedGeneratedImage = localStorage.getItem("generatedImage");
    const savedGeneratedImages = localStorage.getItem("generatedImages");

    if (savedUserPhoto) setUserPhoto(JSON.parse(savedUserPhoto));
    if (savedProductPhoto) setProductPhoto(JSON.parse(savedProductPhoto));
    if (savedGeneratedImage) setGeneratedImage(savedGeneratedImage);
    if (savedGeneratedImages) setGeneratedImages(JSON.parse(savedGeneratedImages));

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

    const openPreview = () => {
      if (!generatedImage) return;
      setIsPreviewOpen(true);
    };

    const closePreview = () => setIsPreviewOpen(false);

    // Close preview with ESC
    useEffect(() => {
      if (!isPreviewOpen) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") closePreview();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [isPreviewOpen]);

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

  // Dynamic prompt generator based on user preferences
  const generatePrompt = () => {
    const genderText = gender === "male" ? "man" : gender === "female" ? "woman" : "person";
    const fitText = fitPreference === "tight" ? "fitted and snug" : fitPreference === "loose" ? "relaxed and comfortable" : "well-fitted";
    const backgroundText = preserveBackground ? "Maintain the original background exactly as shown." : "You may adjust the background for better composition.";
    
    let viewAngleText = "";
    switch (viewAngle) {
      case "front":
        viewAngleText = "Show the garment from the front view, focusing on how it looks from the front angle.";
        break;
      case "back":
        viewAngleText = "Show the garment from the back view, focusing on the rear appearance and back design of the garment.";
        break;
      // case "side":
      //   viewAngleText = "Show the garment from a side profile view, highlighting the side silhouette and fit.";
      //   break;
      case "multiple":
        viewAngleText = "Show the garment from multiple angles if possible, capturing both front and back views to give a complete look.";
        break;
    }
    
    let garmentDescription = "";
    switch (garmentCategory) {
      case "top":
        garmentDescription = "upper body garment (shirt, t-shirt, blouse, or jacket)";
        break;
      case "bottom":
        garmentDescription = "lower body garment (pants, jeans, skirt, or shorts)";
        break;
      case "dress":
        garmentDescription = "full-length dress or one-piece outfit";
        break;
      case "undergarment":
        garmentDescription = gender === "male" 
          ? "men's undergarment (briefs, boxers, or undershirt) with natural body contours and appropriate coverage"
          : "women's undergarment (bra, panties, or lingerie) with natural body contours, proper fit, and appropriate coverage";
        break;
    }

    return `Professional fashion photography: You are creating a high-quality virtual try-on for a ${genderText}. Seamlessly blend the ${garmentDescription} from the second image onto the person in the first image. 

Key requirements:
- Maintain the person's natural body pose, facial features, skin tone, and body proportions
- Ensure the garment has a ${fitText} appearance with realistic fabric draping and texture
- ${viewAngleText}
- Pay attention to proper lighting, shadows, and highlights that match the original photo
- Keep all body parts naturally proportioned and positioned
- ${backgroundText}
- The final result should look like a professional product photoshoot with natural, realistic appearance
- Ensure appropriate coverage and natural body contours for the garment type

Focus on realism, proper fit, and professional quality.`;
  };

  const handleGenerateTryOn = async () => {
    if (!userPhoto || !productPhoto) return toast.error("Please upload both photos");
    if (!FAL_API_KEY) return toast.error("Missing Fal API key in .env");

    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedImages([]);

    toast.info("Starting AI try-on generation...", { duration: 3000 });

    try {
      // Use fashn model for dresses and full-body garments, nano-banana for others
      const useFashnModel = garmentCategory === "dress";
      const modelEndpoint = useFashnModel 
        ? "fal-ai/fashn/tryon/v1.6" 
        : "fal-ai/nano-banana/edit";

      // If user selected 'multiple', request 2 images (front and back)
      const numImages = viewAngle === "multiple" ? 2 : 1;

      if (useFashnModel) {
        // Use fashn model for dresses/one-piece garments
        const submitResponse = await fetch(`https://queue.fal.run/${modelEndpoint}`, {
          method: "POST",
          headers: {
            Authorization: `Key ${FAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            person_image_url: userPhoto.data,
            garment_image_url: productPhoto.data,
            num_images: numImages,
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
            `https://queue.fal.run/${modelEndpoint}/requests/${request_id}/status`,
            { headers: { Authorization: `Key ${FAL_API_KEY}` } }
          );
          status = await statusResponse.json();

        } while (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS");

        if (status.status === "FAILED") throw new Error("Try-on failed on server");

        const resultResponse = await fetch(
          `https://queue.fal.run/${modelEndpoint}/requests/${request_id}`,
          { headers: { Authorization: `Key ${FAL_API_KEY}` } }
        );
        const result = await resultResponse.json();

        if (result?.images?.length) {
          if (numImages === 2) {
            setGeneratedImages([result.images[0].url, result.images[1].url]);
            localStorage.setItem("generatedImages", JSON.stringify([result.images[0].url, result.images[1].url]));
          } else {
            setGeneratedImage(result.images[0].url);
            localStorage.setItem("generatedImage", result.images[0].url);
          }
          toast.success("Virtual try-on generated successfully! 🎉");
        } else throw new Error("No image generated");

      } else {
        // Use nano-banana for regular clothing items with dynamic prompt
        const dynamicPrompt = generatePrompt();
        
        const submitResponse = await fetch(`https://queue.fal.run/${modelEndpoint}`, {
          method: "POST",
          headers: {
            Authorization: `Key ${FAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: dynamicPrompt,
            image_urls: [userPhoto.data, productPhoto.data],
            num_images: numImages,
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
            `https://queue.fal.run/${modelEndpoint}/requests/${request_id}/status`,
            { headers: { Authorization: `Key ${FAL_API_KEY}` } }
          );
          status = await statusResponse.json();

        } while (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS");

        if (status.status === "FAILED") throw new Error("Try-on failed on server");

        const resultResponse = await fetch(
          `https://queue.fal.run/${modelEndpoint}/requests/${request_id}`,
          { headers: { Authorization: `Key ${FAL_API_KEY}` } }
        );
        const result = await resultResponse.json();

        if (result?.images?.length) {
          if (numImages === 2) {
            setGeneratedImages([result.images[0].url, result.images[1].url]);
            localStorage.setItem("generatedImages", JSON.stringify([result.images[0].url, result.images[1].url]));
          } else {
            setGeneratedImage(result.images[0].url);
            localStorage.setItem("generatedImage", result.images[0].url);
          }
          toast.success("Virtual try-on generated successfully! 🎉");
        } else throw new Error("No image generated");
      }

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
    } catch {
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
    } catch {
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
          <Card className="surface ">
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
          <Card className=" rounded-xl">
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

        {/* Preferences Form */}
        <Card className="surface rounded-xl max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Try-On Preferences</CardTitle>
            <CardDescription>Help us generate the perfect result by answering a few questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gender Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Who is trying on? 👤</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["male", "female", "unisex"]?.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g as typeof gender)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      gender === g
                        ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/20 "
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    {g === "male" ? "👨 Male" : g === "female" ? "👩 Female" : "🧑 Unisex"}
                  </button>
                ))}
              </div>
            </div>

            {/* Garment Category */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">What type of garment? 👔</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: "top", label: "Top", icon: "👕", desc: "Shirts, blouses" },
                  { value: "bottom", label: "Bottom", icon: "👖", desc: "Pants, skirts" },
                  { value: "dress", label: "Dress", icon: "👗", desc: "Full outfits" },
                  { value: "undergarment", label: "Underwear", icon: "🩱", desc: "Intimate wear" },
                ]?.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setGarmentCategory(cat.value as typeof garmentCategory)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      garmentCategory === cat.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        garmentCategory === cat.value 
                          ? "text-purple-900 " 
                          : "text-gray-900 "
                      }`}>
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-gray-500 ">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fit Preference */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preferred fit? 📏</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { value: "tight", label: "Tight", icon: "🔥" },
                  { value: "regular", label: "Regular", icon: "✅" },
                  { value: "loose", label: "Loose", icon: "🌊" },
                ]?.map((fit) => (
                  <button
                    key={fit.value}
                    onClick={() => setFitPreference(fit.value as typeof fitPreference)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      fitPreference === fit.value
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20 "
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="mr-1">{fit.icon}</span>
                    {fit.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Angle Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Viewing angle? 📸</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { value: "front", label: "Front", icon: "👤", desc: "Front view" },
                  { value: "back", label: "Back", icon: "🔙", desc: "Back view" },
                  // { value: "side", label: "Side", icon: "↔️", desc: "Side profile" },
                  { value: "multiple", label: "Both", icon: "🔄", desc: "Front & back" },
                ]?.map((angle) => (
                  <button
                    key={angle.value}
                    onClick={() => setViewAngle(angle.value as typeof viewAngle)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      viewAngle === angle.value
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{angle.icon}</span>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        viewAngle === angle.value 
                          ? "text-orange-900 " 
                          : "text-gray-900 "
                      }`}>
                        {angle.label}
                      </p>
                      <p className="text-[10px] ">{angle.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Preference */}
            <div className="flex items-center justify-between  p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Keep original background? 🖼️</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Preserve your photo&apos;s background exactly as is
                </p>
              </div>
              <button
                onClick={() => setPreserveBackground(!preserveBackground)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preserveBackground ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preserveBackground ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex flex-col items-center justify-center">
          <Button onClick={handleGenerateTryOn} disabled={!userPhoto || !productPhoto || isGenerating} size="lg" className="cursor-pointer sm:w-2xs w-full  px-6 bg-gray-100 border border-gray-300 text-gray-800 hover:bg-gray-200 transition-colors">
            {isGenerating ? <><Loader2Icon className="w-5 h-5 animate-spin mr-2" /> Generating...</> : "Generate Virtual Try-On"}
          </Button>
          {isGenerating && (
            <div className="mt-3 text-sm text-gray-600 animate-pulse text-center">
              Please wait while we generate your virtual try-on. This may take up to 1 minute depending on server load.
            </div>
          )}
        </div>

        {/* Result Card */}
        {(generatedImage || generatedImages.length > 0) && (
          <Card className="surface rounded-xl max-w-xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg">Result</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={openPreview}
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 sm:h-9 sm:w-9"
                    title="Preview full screen"
                    aria-label="Preview full screen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 text-xs sm:text-sm"
                    title="Download image"
                    aria-label="Download image"
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
                    title="Share image"
                    aria-label="Share image"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Show two images side by side if 'multiple' view, else one image */}
              {generatedImages.length === 2 ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="relative w-full max-w-xs">
                    <Image
                      src={generatedImages[0]}
                      alt="Front view result"
                      width={400}
                      height={400}
                      className="rounded-lg object-cover w-full h-auto"
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 text-xs px-2 py-1 rounded shadow">Front View</div>
                  </div>
                  <div className="relative w-full max-w-xs">
                    <Image
                      src={generatedImages[1]}
                      alt="Back view result"
                      width={400}
                      height={400}
                      className="rounded-lg object-cover w-full h-auto"
                    />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 text-xs px-2 py-1 rounded shadow">Back View</div>
                  </div>
                </div>
              ) : (
                <div className="relative mx-auto w-full max-w-sm">
                  <button
                    type="button"
                    onClick={openPreview}
                    className="group block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="Open preview"
                  >
                    <div className="aspect-square w-full bg-black/5 dark:bg-white/5">
                      <Image
                        src={generatedImage || generatedImages[0]}
                        alt="Virtual try-on result"
                        width={640}
                        height={640}
                        sizes="(max-width: 640px) 90vw, 400px"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                      />
                    </div>
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden video element */}
        <video ref={videoRef} className="hidden" />

        {/* Fullscreen Preview Overlay */}
        {isPreviewOpen && generatedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
            role="dialog"
            aria-modal="true"
            onClick={closePreview}
          >
            <div className="relative mx-auto my-auto w-[92vw] max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closePreview}
                className="absolute -top-12 right-0 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close preview"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image
                  src={generatedImage}
                  alt="Generated preview"
                  width={1200}
                  height={1200}
                  sizes="(max-width: 768px) 92vw, 70vw"
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
