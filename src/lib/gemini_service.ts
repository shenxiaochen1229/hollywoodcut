import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Helper to convert base64 image data to the format expected by the Gemini Vision API
 */
function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data.split(",")[1] || base64Data,
      mimeType
    },
  };
}


export async function generateGeminiCompositeImage(
    characterPrompt: string, 
    userImageBase64: string,
    backdropPath?: string
): Promise<string> {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }
  
    try {
      const finalPrompt = `
      环境背景设定：在一个非常真实的电影拍摄现场（片场探班），有灯光设备、摄影机等片场元素。如果你知道背景图（${backdropPath || '无'}）请融入该风格。
      电影拍摄场景指令：${characterPrompt}
      
      动作与构图要求：
      1. 使用提供的照片作为其中一个人物的脸部参考（即“探班访客”），并保持高度一致的原始外貌。
      2. 访客与电影角色并肩站在一起，表现出友好的合影姿态。
      3. 画面必须是 2010 年代低质量手机抓拍风格，配有刺眼的闪光灯。
      `;
  
      const url = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${apiKey}`;
      const mimeType = userImageBase64.split(";")[0].split(":")[1] || "image/jpeg";
      const base64Data = userImageBase64.split(",")[1] || userImageBase64;
      
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: finalPrompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }
        ]
      };
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Nano Banana API Error:", errorText);
        throw new Error("图像生成失败：" + errorText.substring(0, 100));
      }
  
      const data = await response.json();
      
      const candidates = data.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
          const part = candidates[0].content.parts[0];
          // Nano Banana might return image in inlineData
          if (part.inlineData) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          } else if (part.text) {
              console.warn("Nano banana returned text instead of image:", part.text);
          }
      }
      throw new Error("生成的图像数据为空。");
      
    } catch (error) {
      console.error("Error generating Nano Banana composite image:", error);
       throw error;
    }
}
