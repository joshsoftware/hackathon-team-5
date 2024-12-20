import { linkSchema } from "@/validators/LinkValidator";

export async function POST(req:Request){
    try{
        const body = await req.json();
        const {url} = linkSchema.parse(body)

        
    }catch(e){
        console.log(e)
    }
}