import os
from openai import OpenAI
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"], base_url="http://localhost:8080/v1")
print(client.responses.create(model="gpt-4o-mini", input="Say hello in five words.").output_text)
