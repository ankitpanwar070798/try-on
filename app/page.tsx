'use client';

import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";
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

interface UserPhoto {
  data: string;
  name: string;
  createdAt: string;
}

interface QueueStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  queue_position?: number;
  logs?: Array<{ message: string; timestamp: string }>;
  response_url?: string;
}

interface QueueSubmitResponse {
  request_id: string;
  status_url: string;
  response_url: string;
}

interface VirtualTryOnResponse {
  images: Array<{
    url: string;
  }>;
  description?: string;
}

export default function VirtualTryOnApp() {
  const [userPhoto, setUserPhoto] = useState<UserPhoto | null>(null);
  const [productPhoto, setProductPhoto] = useState<UserPhoto | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isUploadingUser, setIsUploadingUser] = useState(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUserPhoto = localStorage.getItem('userPhoto');
    const savedProductPhoto = localStorage.getItem('productPhoto');
    const savedApiKey = localStorage.getItem('falApiKey');
    const savedGeneratedImage = localStorage.getItem('generatedImage');

    if (savedUserPhoto) {
      setUserPhoto(JSON.parse(savedUserPhoto));
    }
    if (savedProductPhoto) {
      setProductPhoto(JSON.parse(savedProductPhoto));
    }
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedGeneratedImage) {
      setGeneratedImage(savedGeneratedImage);
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUserFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploadingUser(true);

    try {
      const base64 = await fileToBase64(file);

      const photoData: UserPhoto = {
        data: base64,
        name: file.name,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('userPhoto', JSON.stringify(photoData));
      setUserPhoto(photoData);
    } catch (error) {
      console.error("Failed to upload user photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingUser(false);
    }
  };

  const handleProductFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploadingProduct(true);

    try {
      const base64 = await fileToBase64(file);

      const photoData: UserPhoto = {
        data: base64,
        name: file.name,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('productPhoto', JSON.stringify(photoData));
      setProductPhoto(photoData);
    } catch (error) {
      console.error("Failed to upload product photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingProduct(false);
    }
  };

  const handleRemoveUserPhoto = () => {
    localStorage.removeItem('userPhoto');
    setUserPhoto(null);
  };

  const handleRemoveProductPhoto = () => {
    localStorage.removeItem('productPhoto');
    setProductPhoto(null);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      alert("Please enter a valid API key");
      return;
    }

    setIsSavingApiKey(true);
    try {
      localStorage.setItem('falApiKey', apiKey.trim());
      console.log("API key saved successfully");
    } catch (error) {
      console.error("Failed to save API key:", error);
      alert("Failed to save API key. Please try again.");
    } finally {
      setIsSavingApiKey(false);
    }
  };

  const generateVirtualTryOn = async (
    userPhoto: string,
    productImage: string,
  ): Promise<string> => {
    if (!apiKey) {
      throw new Error("Please set your Fal AI API key first.");
    }

    try {
      // Step 1: Submit request to Fal AI queue
      const submitResponse = await fetch(
        "https://queue.fal.run/fal-ai/nano-banana/edit",
        {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt:
              "Create a professional e-commerce fashion photo. Take the dress from the second image and let the person from the first image wear it. Keep the person from the first image body pose, face, and background intact. Make it look natural and realistic.",
            image_urls: [userPhoto, productImage],
            num_images: 1,
            output_format: "jpeg",
          }),
        },
      );

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error("Submit request failed:", submitResponse.status, errorText);

        if (submitResponse.status === 402) {
          throw new Error("Insufficient balance");
        }

        if (submitResponse.status === 401) {
          throw new Error("Please check your Fal API key.");
        }

        throw new Error(`${submitResponse.status} ${errorText}`);
      }

      const submitResult: QueueSubmitResponse = await submitResponse.json();
      const { request_id } = submitResult;
      console.log("Request submitted successfully", request_id);

      // Step 2: Poll status until completion
      let status: QueueStatusResponse;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5-second intervals

      do {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await fetch(
          `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}/status`,
          {
            headers: {
              Authorization: `Key ${apiKey}`,
            },
          },
        );

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error("Status check failed:", statusResponse.status, errorText);
          throw new Error(`Failed to check status: ${statusResponse.statusText}`);
        }

        status = await statusResponse.json();
        console.log(`Status check ${attempts + 1}:`, status.status);
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error("Request timed out after 5 minutes");
        }
      } while (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS");

      if (status.status === "FAILED") {
        console.error("Request failed on server:", status.logs);
        throw new Error("Virtual try-on generation failed on server");
      }

      // Step 3: Get the result
      const resultResponse = await fetch(
        `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}`,
        {
          headers: {
            Authorization: `Key ${apiKey}`,
          },
        },
      );

      if (!resultResponse.ok) {
        const errorText = await resultResponse.text();
        console.error("Result fetch failed:", resultResponse.status, errorText);
        throw new Error(`Failed to get result: ${resultResponse.statusText}`);
      }

      const result: VirtualTryOnResponse = await resultResponse.json();
      console.log("Result received:", result);

      // Extract the generated image URL from the response
      if (result?.images?.length && result.images.length > 0) {
        console.log("Virtual try-on generation completed successfully");
        return result.images[0].url;
      }

      throw new Error("No image was generated");
    } catch (error) {
      console.error("Error generating virtual try-on with Fal AI:", error);
      throw error;
    }
  };

  const handleGenerateTryOn = async () => {
    if (!userPhoto || !productPhoto) {
      alert("Please upload both your photo and product photo");
      return;
    }

    if (!apiKey) {
      alert("Please enter your Fal AI API key");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const result = await generateVirtualTryOn(userPhoto.data, productPhoto.data);
      setGeneratedImage(result);
      localStorage.setItem('generatedImage', result);
    } catch (error) {
      console.error("Virtual try-on failed:", error);
      alert(error instanceof Error ? error.message : "Failed to generate virtual try-on");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearResult = () => {
    setGeneratedImage(null);
    localStorage.removeItem('generatedImage');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Virtual Try-On
          </h1>
          <p className="text-lg text-gray-600">
            Upload your photo and a product image to see how it looks on you
          </p>
        </div>

        {/* API Key Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>
              Please enter your Fal AI API key to use virtual try-on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your Fal API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSaveApiKey}
                disabled={isSavingApiKey}
              >
                {isSavingApiKey && <Loader2Icon className="w-4 h-4 animate-spin mr-2" />}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* User Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Your Photo</CardTitle>
              <CardDescription>
                Upload a clear photo of yourself for better results
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {!userPhoto ? (
                <>
                  <ImageIcon size={48} className="text-gray-400 mb-4" />
                  <p className="text-center text-gray-500 mb-4">
                    No photo uploaded yet
                  </p>
                </>
              ) : (
                <div className="relative mb-4">
                  <img
                    src={userPhoto.data}
                    alt={userPhoto.name}
                    className="w-64 h-64 rounded-lg border object-cover"
                  />
                  <Button
                    onClick={handleRemoveUserPhoto}
                    className="absolute top-2 right-2"
                    variant="destructive"
                    size="sm"
                    title="Remove photo"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="w-full">
                <Input
                  id="user-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUserFileUpload}
                  disabled={isUploadingUser}
                  className="hidden"
                />
                <Button
                  asChild
                  className="w-full"
                  variant={userPhoto ? "outline" : "default"}
                >
                  <Label htmlFor="user-file-upload" className="cursor-pointer">
                    {isUploadingUser ? (
                      <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UploadIcon className="w-4 h-4 mr-2" />
                    )}
                    Upload {userPhoto ? "New" : ""} Photo
                  </Label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Photo</CardTitle>
              <CardDescription>
                Upload the clothing item you want to try on
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {!productPhoto ? (
                <>
                  <ImageIcon size={48} className="text-gray-400 mb-4" />
                  <p className="text-center text-gray-500 mb-4">
                    No product uploaded yet
                  </p>
                </>
              ) : (
                <div className="relative mb-4">
                  <img
                    src={productPhoto.data}
                    alt={productPhoto.name}
                    className="w-64 h-64 rounded-lg border object-cover"
                  />
                  <Button
                    onClick={handleRemoveProductPhoto}
                    className="absolute top-2 right-2"
                    variant="destructive"
                    size="sm"
                    title="Remove photo"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="w-full">
                <Input
                  id="product-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProductFileUpload}
                  disabled={isUploadingProduct}
                  className="hidden"
                />
                <Button
                  asChild
                  className="w-full"
                  variant={productPhoto ? "outline" : "default"}
                >
                  <Label htmlFor="product-file-upload" className="cursor-pointer">
                    {isUploadingProduct ? (
                      <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UploadIcon className="w-4 h-4 mr-2" />
                    )}
                    Upload {productPhoto ? "New" : ""} Product
                  </Label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleGenerateTryOn}
            disabled={!userPhoto || !productPhoto || !apiKey || isGenerating}
            size="lg"
            className="px-8"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="w-5 h-5 animate-spin mr-2" />
                Generating Virtual Try-On...
              </>
            ) : (
              "Generate Virtual Try-On"
            )}
          </Button>
        </div>

        {/* Generated Result */}
        {generatedImage && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Generated Result</CardTitle>
                  <CardDescription>
                    Your virtual try-on result
                  </CardDescription>
                </div>
                <Button
                  onClick={handleClearResult}
                  variant="outline"
                  size="sm"
                >
                  Clear Result
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img
                src={generatedImage}
                alt="Virtual try-on result"
                className="max-w-md rounded-lg border shadow-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Get your Fal AI API key from <a href="https://fal.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">fal.ai</a></li>
              <li>Enter your API key in the setup section above</li>
              <li>Upload a clear photo of yourself</li>
              <li>Upload the clothing item you want to try on</li>
              <li>Click "Generate Virtual Try-On" and wait for the AI to process</li>
              <li>View your personalized virtual try-on result!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}