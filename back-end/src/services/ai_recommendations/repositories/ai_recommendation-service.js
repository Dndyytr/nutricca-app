import axios from 'axios';
import AiRecommendationRepository from '../repositories/ai_recommendation-repositories.js';
import { buildUserAiPayload } from '../../../utils/ai-payload-builder.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

class AiRecommendationService {
  async generateAndSaveDailyPlan(userId, targetDate) {
    // 1. Ambil data profil utuh user dari DB
    const rawUser = await AiRecommendationRepository.getFullUserProfile(userId);

    if (!rawUser || !rawUser.age || !rawUser.weight) {
      throw new NotFoundError(
        'Profil kesehatan belum lengkap. Harap selesaikan onboarding terlebih dahulu.',
      );
    }

    // 2. Terjemahkan data DB menjadi format AI (Sesuai skema Pydantic UserInput)
    const userProfileForAi = buildUserAiPayload(rawUser);

    // =================================================================
    // TAMBAHAN BARU: Ambil 30 resep acak dan masukkan ke payload AI
    // =================================================================
    const randomCandidates =
      await AiRecommendationRepository.getRandomRecipes(30);
    userProfileForAi.available_recipes = randomCandidates;

    // =================================================================
    // PASANG CCTV DI SINI UNTUK MELIHAT APA YANG DIKIRIM NODE.JS
    // =================================================================
    console.log('\n================ DEBUGGING AI ================');
    console.log(
      `Jumlah kandidat resep dikirim: ${userProfileForAi.available_recipes?.length || 0}`,
    );
    if (userProfileForAi.available_recipes?.length > 0) {
      console.log(
        'Contoh ID resep ke-1:',
        userProfileForAi.available_recipes[0].recipe_id,
      );
      console.log(
        'Contoh ID resep ke-2:',
        userProfileForAi.available_recipes[1].recipe_id,
      );
    } else {
      console.log('⚠️ WARNING: Tabel recipes di database masih KOSONG!');
    }
    console.log('==============================================\n');

    let top10Recipes = [];

    // 3. Kirim ke FastAPI AI Engine
    try {
      const response = await axios.post(
        'http://ai-api:8000/recommend',
        userProfileForAi,
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.data || !Array.isArray(response.data.recommendations)) {
        throw new Error('Respons AI tidak valid atau kosong');
      }

      top10Recipes = response.data.recommendations;
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        console.error('>>> AI ENGINE TIMEOUT');
        throw new InvariantError(
          'AI Engine tidak merespons, coba beberapa saat lagi.',
        );
      }
      if (err.response) {
        console.error(
          '>>> ERROR DARI FASTAPI:',
          err.response.status,
          err.response.data,
        );
        throw new InvariantError(
          `AI Engine error: ${err.response.data?.detail?.[0]?.msg || 'Unknown error'}`,
        );
      }
      console.error('>>> NETWORK ERROR KE AI ENGINE:', err.message);
      throw new InvariantError('Gagal mendapatkan rekomendasi dari AI Engine.');
    }

    // 4. Upsert (Simpan / Perbarui) ke database
    const recommendation =
      await AiRecommendationRepository.upsertAiRecommendation({
        userId,
        targetDate,
        mealPlanJson: top10Recipes,
        workoutPlanJson: {},
      });

    if (!recommendation) {
      throw new InvariantError(
        'Gagal menyimpan atau memperbarui hasil recommendation AI ke database.',
      );
    }

    return recommendation;
  }
}

export default new AiRecommendationService();
