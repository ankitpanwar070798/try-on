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

export default function VirtualTryOn() {
  const [userPhoto, setUserPhoto] = useState<UserPhoto | null>(null);
  const [productPhoto, setProductPhoto] = useState<UserPhoto | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isUploadingUser, setIsUploadingUser] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [gender, setGender] = useState<"male" | "female" | "unisex">("male");
  const [garmentCategory, setGarmentCategory] = useState<"top" | "bottom" | "dress" | "undergarment">("top");
  const [fitPreference, setFitPreference] = useState<"tight" | "regular" | "loose">("regular");


  // Load saved data from localStorage
  useEffect(() => {
    const savedUserPhoto = localStorage.getItem("userPhoto");
    const savedProductPhoto = localStorage.getItem("productPhoto");
    const savedGeneratedImage = localStorage.getItem("generatedImage");

    if (savedUserPhoto) setUserPhoto(JSON.parse(savedUserPhoto));
    if (savedProductPhoto) setProductPhoto(JSON.parse(savedProductPhoto));
    if (savedGeneratedImage) setGeneratedImages([savedGeneratedImage]);

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

  const handleGenerateTryOn = async () => {
    if (!userPhoto || !productPhoto) return toast.error("Please upload both photos");

    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedImages([]);

    toast.info("Starting AI try-on generation...", { duration: 3000 });

    try {
      // Helper to call the API with a specific prompt and negativePrompt
      const generate = async ({ prompt, negativePrompt }: { prompt: string; negativePrompt: string }) => {
        const res = await fetch("/api/generate-tryon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPhoto: userPhoto.data,
            productPhoto: productPhoto.data,
            prompt,
            negativePrompt,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.image) throw new Error(data.error || "Failed to generate try-on");
        return data.image;
      };

      // Only single image generation now
      const image = await generate(generatePrompt());
      setGeneratedImage(image);
      localStorage.setItem("generatedImage", image);
      toast.success("Virtual try-on generated successfully! 🎉");
    } catch {
      toast.error("Failed to generate try-on");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (generatedImages.length === 0) return;

    try {
      const response = await fetch(generatedImages[0]);
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
    if (generatedImages.length === 0) return;

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        // For Web Share API, we need to convert the image to a File
        const response = await fetch(generatedImages[0]);
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
        await navigator.clipboard.writeText(generatedImages[0]);
        toast.success("Image link copied to clipboard! 📋");
      }
    } catch (err) {
      // If sharing fails, try copying to clipboard as fallback
      try {
        await navigator.clipboard.writeText(generatedImages[0]);
        toast.success("Image link copied to clipboard! 📋");
      } catch {
        toast.error("Unable to share. Please try downloading instead.");
      }
    }
  };

  // Dynamic prompt generator based on user preferences
const generatePrompt = () => {
  const genderText =
    gender === "male" ? "man" : gender === "female" ? "woman" : "person";

  const fitText =
    fitPreference === "tight"
      ? "snug fit, body-hugging, tailored"
      : fitPreference === "loose"
      ? "relaxed fit, slightly oversized"
      : "natural fit, balanced shape";

  let garmentDescription = "";
  switch (garmentCategory) {
    case "top":
      garmentDescription = "upper-body clothing (shirt, t-shirt, blouse, jacket)";
      break;
    case "bottom":
      garmentDescription = "lower-body clothing (pants, jeans, skirt, shorts)";
      break;
    case "dress":
      garmentDescription = "full-body outfit (dress or gown)";
      break;
    case "undergarment":
      garmentDescription =
        gender === "male"
          ? "men’s undergarment (briefs, boxers, undershirt)"
          : "women’s undergarment (bra, panties, lingerie)";
      break;
  }

  let basePrompt = `
professional fashion photoshoot of a ${genderText} wearing ${garmentDescription}, 
realistic virtual try-on, ${fitText}, natural body proportions, 
soft studio lighting, high-detail fabric texture, natural skin tone, 
realistic shadows and reflections, seamless garment integration, 
preserve original background, realistic posture, 8k photo, DSLR, shallow depth of field, 
editorial quality, fashion e-commerce photography style.
`;

  if (garmentCategory === "bottom") {
    basePrompt += `
remove existing lower-body clothing, apply only the new garment, 
ensure alignment and natural drape of fabric around legs and waist.`;
  }

  // Optional: model-safe negative prompt guidance
  const negativePrompt = `
blurry, distorted body, double limbs, deformed hands, artifacts, incorrect lighting, 
cartoon, painting, AI-looking texture, unrealistic shadows, mismatched perspective, 
extra clothing layers, transparency, overexposure, bad anatomy.
`;

  return {
    prompt: basePrompt.trim(),
    negativePrompt: negativePrompt.trim(),
  };
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
          <Card className="surface">
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
          <Card className="surface">
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
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${gender === g
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
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${garmentCategory === cat.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${garmentCategory === cat.value
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
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${fitPreference === fit.value
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

            {/* Removed viewing angle selection UI */}


          </CardContent>
        </Card>

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
                <div className="flex gap-2">
                  <Button size="icon" className="cursor-pointer" variant="ghost" title="Preview" onClick={openPreview} disabled={!generatedImage}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="cursor-pointer" variant="ghost" title="Download" onClick={handleDownload} disabled={!generatedImage}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="cursor-pointer" variant="ghost" title="Share" onClick={handleShare} disabled={!generatedImage}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 justify-center items-center">
              <Image src={generatedImage} alt="Virtual try-on result" width={320} height={320} className="rounded-lg" />
            </CardContent>
          </Card>
        )}

        {/* Preview Modal */}
        {isPreviewOpen && generatedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="relative max-w-[95vw] max-h-[90vh] overflow-auto">
              <img
                src={generatedImage}
                alt="Preview"
                className="rounded-xl object-contain w-auto h-auto max-w-full max-h-[90vh]"
              />
              <Button
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white cursor-pointer"
                onClick={closePreview}
              >
                <X className="w-5 h-5 text-black" />
              </Button>
            </div>
          </div>
        )}


        {/* Hidden video element */}
        <video ref={videoRef} className="hidden" />
      </div>
    </div>
  );
}
