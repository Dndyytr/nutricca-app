from fastapi import FastAPI

from app.schemas import (
    UserInput
)

from app.predictor import (
    recommend_recipes
)

app = FastAPI()


@app.get("/")
def home():

    return {
        "message":
        "Food Recommendation API"
    }


@app.post("/recommend")
def recommend(
    user: UserInput
):

    recommendations = (
        recommend_recipes(
            user.dict()
        )
    )

    return {
        "recommendations":
        recommendations
    }