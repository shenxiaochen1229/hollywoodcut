import { NextResponse } from 'next/server';
import { generateGeminiCompositeImage } from '@/lib/gemini_service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, userImageBase64, backdropPath } = body;

    if (!prompt || !userImageBase64) {
      return NextResponse.json(
        { error: 'Missing prompt or user image' },
        { status: 400 }
      );
    }

    console.log("Starting Gemini Image Pipeline...");

    let finalImageBase64 = "";
    try {
      // Use Nano Banana Pro to directly fuse the user image into the movie scene
      console.log("Generating composite image with Nano Banana Pro...");
      finalImageBase64 = await Promise.race([
        generateGeminiCompositeImage(prompt, userImageBase64, backdropPath),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Image generation timeout")), 35000))
      ]);
    } catch (e: any) {
      console.warn("Nano Banana pipeline failed or timed out, falling back to mock:", e.message);
      // 失败时降级返回底图以完成流程，避免前端死锁卡住
      if (backdropPath) {
        finalImageBase64 = `https://image.tmdb.org/t/p/w1280${backdropPath}`;
      } else {
        finalImageBase64 = userImageBase64;
      }
    }

    console.log("Gemini pipeline completed.");
    return NextResponse.json({ success: true, result: finalImageBase64 });
  } catch (error: any) {
    console.error("API Generation Error:", error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
