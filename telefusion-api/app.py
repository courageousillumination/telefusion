from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import replicate
import io

model = replicate.models.get("stability-ai/stable-diffusion")

app = FastAPI()

origins = [
    "http://localhost:1234",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImagineConfig(BaseModel):
    prompt: str

@app.post("/imagine")
async def root(prompt:str = Form(), prompt_strength:float= Form(), file: UploadFile = File()):
    output = model.predict(prompt=prompt, prompt_strength=prompt_strength, init_image=io.BytesIO(file.file.read()))
    return output