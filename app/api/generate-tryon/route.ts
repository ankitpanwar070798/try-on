import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userPhoto, productPhoto } = await req.json();
  const FAL_API_KEY = process.env.NEXT_PUBLIC_FAL_API_KEY;

  if (!userPhoto || !productPhoto || !FAL_API_KEY) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // Your prompt is only on the server now!
  const finalPrompt =
    "prompt: Professional fashion photography: Seamlessly blend the clothing item from the second image onto the person in the first image. Maintain the person's natural body pose, facial features, skin tone, and original background. Ensure realistic fabric draping, proper fit, and natural lighting. The result should look like a high-quality product photo shoot.";

  try {
    const submitResponse = await fetch("https://queue.fal.run/fal-ai/nano-banana/edit", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        image_urls: [userPhoto, productPhoto],
        num_images: 1,
        output_format: "jpeg",
      }),
    });

    if (!submitResponse.ok) {
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    const { request_id } = await submitResponse.json();

    // Poll for status
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

    if (status.status === "FAILED") {
      return NextResponse.json({ error: "Try-on failed on server" }, { status: 500 });
    }

    const resultResponse = await fetch(
      `https://queue.fal.run/fal-ai/nano-banana/requests/${request_id}`,
      { headers: { Authorization: `Key ${FAL_API_KEY}` } }
    );
    const result = await resultResponse.json();

    if (result?.images?.length) {
      return NextResponse.json({ image: result.images[0].url });
    } else {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}