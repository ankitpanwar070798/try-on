import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    userPhoto,
    productPhoto,
    gender,
    garmentCategory,
    fitPreference,
    endpoint = "fashn",
  } = await req.json();
  const FAL_API_KEY = process.env.NEXT_PUBLIC_FAL_API_KEY;

  if (!userPhoto || !productPhoto || !FAL_API_KEY) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // Note: Testing direct base64 approach without upload

  // Generate comprehensive prompt based on user preferences for nano-banana endpoint
  const generatePrompt = (
    gender: "male" | "female" | "unisex",
    garmentCategory: "top" | "bottom" | "dress" | "undergarment",
    fitPreference: "tight" | "regular" | "loose"
  ) => {
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
        garmentDescription =
          "upper-body clothing (shirt, t-shirt, blouse, jacket)";
        break;
      case "bottom":
        garmentDescription =
          "lower-body clothing (pants, jeans, skirt, shorts)";
        break;
      case "dress":
        garmentDescription = "full-body outfit (dress or gown)";
        break;
      case "undergarment":
        garmentDescription =
          gender === "male"
            ? "men's undergarment (briefs, boxers, undershirt)"
            : "women's undergarment (bra, panties, lingerie)";
        break;
    }

    let basePrompt = `
professional fashion photoshoot of a ${genderText} wearing ${garmentDescription}, 
realistic virtual try-on, ${fitText}, natural body proportions, 
soft studio lighting, high-detail fabric texture, natural skin tone, 
realistic shadows and reflections, seamless garment integration, 
preserve original background, realistic posture, 8k photo, DSLR, shallow depth of field, 
editorial quality, fashion e-commerce photography style, photorealistic,
perfect clothing fit, natural fabric draping, accurate color reproduction,
professional model pose, clean composition, high resolution, detailed stitching,
precise hemlines, proper garment placement, natural wrinkles and folds.
`;

    // Add specific instructions based on garment category
    if (garmentCategory === "top") {
      basePrompt += `
Ensure perfect shoulder alignment, natural sleeve positioning, proper neckline fit,
smooth fabric transition across chest and back, realistic button or zipper placement.`;
    }

    if (garmentCategory === "bottom") {
      basePrompt += `
Remove existing lower-body clothing completely, apply only the new garment, 
ensure perfect alignment and natural drape of fabric around legs and waist,
maintain proper proportions and seamless integration, realistic waistband positioning,
natural leg line following, appropriate inseam length.`;
    }

    if (garmentCategory === "dress") {
      basePrompt += `
Replace entire outfit with the dress, ensure full coverage and proper fit,
natural flow of fabric, appropriate length and proportions, elegant silhouette,
smooth transitions from bodice to skirt, realistic dart placements.`;
    }

    if (garmentCategory === "undergarment") {
      basePrompt += `
Subtle and tasteful representation, focus on fit and comfort, 
natural fabric adherence to body contours, appropriate coverage.`;
    }

    // Add fit-specific enhancements
    if (fitPreference === "tight") {
      basePrompt += `
Body-conscious silhouette, fabric follows natural curves closely, 
tailored appearance, structured fit lines.`;
    } else if (fitPreference === "loose") {
      basePrompt += `
Comfortable drape, relaxed silhouette, casual styling, 
natural fabric flow with slight ease.`;
    }

    // Add negative prompt for better quality
    const negativePrompt = `
blurry, distorted body, double limbs, deformed hands, artifacts, incorrect lighting, 
cartoon, painting, AI-looking texture, unrealistic shadows, mismatched perspective, 
extra clothing layers, transparency, overexposure, bad anatomy, floating clothes,
disconnected garments, unnatural poses, low quality, pixelated, watermark,
clothing floating off body, impossible fabric physics, misaligned seams,
distorted proportions, color bleeding, texture inconsistencies.`;

    return {
      prompt: basePrompt.trim(),
      negativePrompt: negativePrompt.trim(),
    };
  };

  try {
    if (endpoint === "fashn") {
      let fashCategory = "auto";
      if (garmentCategory === "top") fashCategory = "tops";
      else if (garmentCategory === "bottom") fashCategory = "bottoms";
      else if (garmentCategory === "dress")
        fashCategory = "one-pieces"; // ✅ FIXED
      else if (garmentCategory === "undergarment") fashCategory = "auto";

      let fashMode = "balanced";
      if (fitPreference === "tight") fashMode = "quality";
      else if (fitPreference === "loose") fashMode = "performance";

      const payload = {
        model_image: userPhoto,
        garment_image: productPhoto,
        category: fashCategory,
        mode: fashMode,
        garment_photo_type: "auto",
        moderation_level: "permissive",
        segmentation_free: true,
        num_samples: 1,
        output_format: "png",
      };

      const res = await fetch("https://fal.run/fal-ai/fashn/tryon/v1.6", {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Fal API Error: ${err}`);
      }

      const result = await res.json();
      const imageUrl =
        result?.image?.url ||
        result?.images?.[0]?.url ||
        result?.data?.images?.[0]?.url ||
        result?.output?.url;

      if (!imageUrl) throw new Error("No image returned from FAL");

      return NextResponse.json({ image: imageUrl, endpoint: "fashn" });
    }

    if (endpoint === "nano-banana") {
      const prompts = generatePrompt(gender, garmentCategory, fitPreference);

      const res = await fetch("https://fal.run/fal-ai/nano-banana/edit", {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompts.prompt,
          image_urls: [userPhoto, productPhoto],
          num_images: 1,
          output_format: "jpeg",
          negative_prompt: prompts.negativePrompt,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Nano-banana API Error: ${err}`);
      }

      const result = await res.json();
      const imageUrl = result?.images?.[0]?.url || result?.image?.url;

      if (!imageUrl) throw new Error("No image returned from nano-banana");

      return NextResponse.json({ image: imageUrl, endpoint: "nano-banana" });
    }

    // fallback
    return NextResponse.json(
      { error: "Unsupported endpoint" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Try-on generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error", endpoint },
      { status: 500 }
    );
  }
}
