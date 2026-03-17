import axios from 'axios';

// 默认使用 HF 的免费推理端点 (使用 SDXL 等基础模型)
const HF_API_KEY = process.env.HF_API_KEY; 
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

export const generateSnapshot = async (
  prompt: string, 
  fallbackMock: boolean = true,
  backdropPath?: string
): Promise<string> => {
  // 如果没有真实 API Key，或者显式请求 Mock，则走后备方案
  if (!HF_API_KEY && fallbackMock) {
    console.log("No API Key detected. Using Mock Image Generation...");
    if (backdropPath) {
       return `https://image.tmdb.org/t/p/original${backdropPath}`;
    }
    return await mockGenerate(prompt);
  }

  try {
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: 'arraybuffer' // 接收二进制图片数据
      }
    );

    // 将二进制数据转换为 Base64，方便前端展示
    const buffer = Buffer.from(response.data, 'binary');
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    return base64Image;
    
  } catch (error) {
    console.error("Image Generation Failed, falling back to Mock:", error);
    if (fallbackMock) return await mockGenerate(prompt);
    throw error;
  }
};

// 模拟生图过程，提供视觉占位符
const mockGenerate = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 通过 url 携带 prompt 关键词生成占位图
      const encodedPrompt = encodeURIComponent(prompt.substring(0, 50) + "...");
      resolve(`https://placehold.co/1024x1024/2d3748/10b981.png?text=Generated+Snapshot%5Cn%5Cn${encodedPrompt}`);
    }, 2500); // 模拟网络延迟
  });
};
