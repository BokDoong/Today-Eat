import database from "../database";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const campersData = async (req,res,next) => {
    try{
        const url1 = `http://www.career.go.kr/cnet/openapi/getOpenApi?apiKey=${process.env.careernetKey}&svcType=api&svcCode=SCHOOL&contentType=json&gubun=univ_list&sch1=100323&sch2=100328&perPage=3000`;
        const data = await axios.get(url1)
            .then((result)=>{
                return result.data.dataSearch.content
            })
        for (const result of data){
            const name = result.schoolName;
            const campers = result.campusName;
            const headers = {'Authorization':process.env.kakaoKey};
            let url2;
            if(campers!=="본교"){
                url2 = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${name+" "+campers}`;
            }
            else {
                url2 = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${name}`;
            }
            const addressData = await axios.get(url2,{headers:headers})
            console.log(name+" "+campers);
            try{
                let university = await database.university.findFirst({
                    where:{
                        name:name,
                    }
                })
                if(!university){
                    university = await database.university.create({
                        data:{
                            name:name,
                        }
                    });
                }
                await database.campers.create({
                    data:{
                        name:campers,
                        x:Number(addressData.data.documents[0].x),
                        y:Number(addressData.data.documents[0].y),
                        university:{
                            connect:{
                                id:university.id,
                            }
                        }
                    }
                });
            }catch(err){
            }
        };
        res.status(200).send("OK");
    }catch(err){
        next(err);
    }
}