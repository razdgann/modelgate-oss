import OpenAI from 'openai';
const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY,baseURL:'http://localhost:8080/v1'});
const response=await client.responses.create({model:'gpt-4o-mini',input:'Say hello in five words.'});console.log(response.output_text);
