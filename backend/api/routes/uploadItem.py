from fastapi import APIRouter, UploadFile
from openai import OpenAI
import base64
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/")
async def upload_item(file: UploadFile):
    readFile = await file.read()
    base64_image = base64.b64encode(readFile).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Only output an array describing this clothing/item image in keywords, concerning type of item, color, material, etc."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
    )
    
    
    
    

    return response.choices[0].message.content
