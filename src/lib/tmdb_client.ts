"use server";
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const searchMovie = async (query: string) => {
  if (!query) return [];
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'en-US',
      }
    });
    return response.data.results;
  } catch (error) {
    console.error("TMDB Search Error:", error);
    return [];
  }
};

export const getMovieCredits = async (movieId: number) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
      params: {
        api_key: TMDB_API_KEY,
      }
    });
    return response.data.cast.slice(0, 10); // 只取前10个角色
  } catch (error) {
    console.error("TMDB Credits Error:", error);
    return [];
  }
};
