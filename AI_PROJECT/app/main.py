from fastapi import FastAPI

from predictor import recommend
from schemas import UserInput


app = FastAPI()


@app.get("/")
def home():

    return {
        "message":
        "Recipe Recommendation API Running"
    }


@app.post("/recommend")
def get_recommendation(user_input: UserInput):

    results = recommend(
        user_input.dict(),
        top_k=10
    )

    return {
        "recommendations": results
    }