import axios from 'axios';

// 默认使用 Replicate API
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// FaceSwap API (假设我们调用的是 replicate 上的通用 faceswap 模型，如 lucidrains/faceswap)
// 为本 demo，我们需要定义一种 Mock 返回
export const processFaceSwap = async (
  targetImageBase64: string, // 底图 (带有游客和明星的合影)
  sourceImageBase64: string, // 用户上传的自拍
  fallbackMock: boolean = true
): Promise<string> => {
  if (!REPLICATE_API_TOKEN && fallbackMock) {
    console.log("No Replicate Token detected. Using Mock FaceSwap...");
    return await mockFaceSwap(targetImageBase64);
  }

  // 以下为真实接入 Replicate 的预留逻辑
  try {
    /* 
    const response = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "x",
        input: { target: targetImageBase64, swap_image: sourceImageBase64 }
      },
      { headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` } }
    );
    // 轮询获取结果...
    */
    throw new Error("Real Replicate Integration Needs Complete Setup");
  } catch (error) {
    console.error("FaceSwap Failed, falling back to Mock:", error);
    if (fallbackMock) return await mockFaceSwap(targetImageBase64);
    throw error;
  }
};

const mockFaceSwap = (targetImageBase64: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 在 Mock 演示模式下，为了保证“对应感”，我们直接返回底图
      // 用户会看到选中的电影剧照，虽然没有真正换脸，但视觉上不再是报错方块
      resolve(targetImageBase64);
    }, 1500); 
  });
};
