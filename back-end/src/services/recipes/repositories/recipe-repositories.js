import { Pool } from 'pg';

class RecipeRepository {
  constructor() {
    this.pool = new Pool();
  }
  async getRandomRecipes(limit = 30) {
    const query = 'SELECT * FROM recipes ORDER BY RANDOM() LIMIT $1';
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }

  async getRecipeById(id) {
    const query = 'SELECT * FROM recipes WHERE recipe_id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }
}

export default new RecipeRepository();
