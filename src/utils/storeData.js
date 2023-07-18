import database from "../database";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const storeData = async (req,res,next) => {
    try{
        const campers = await database.campers.findMany();
        for(const data of campers){
            console.log("id : ",data.id," campers : ",data.name);
            const x = data.x;
            const y = data.y;
            const campersId = data.id;

            for(let i=1;i<4;i++){
                const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&radius=20000&x=${x}&y=${y}&size=15&page=${i}&sort=distance`;
                await getPlaces(url,campersId);
            }
            for(let i=1;i<4;i++){
                const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&radius=20000&x=${x}&y=${y}&size=15&page=${i}`;
                await getPlaces(url,campersId);
            }
            for(let i=1;i<4;i++){
                const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&radius=20000&x=${x}&y=${y}&size=15&page=${i}`;
                await getPlaces(url,campersId);
            }
        }
        res.status(200).send("OK");
    }
    catch(err){}
}

const getPlaces = async (url,campersId) => {
    const headers = {'Authorization':process.env.kakaoKey};

    await axios.get(url,{headers:headers})
    .then((response)=>{
        response.data.documents.map(async (data)=>{
            const name = data.place_name;
            const address = data.road_address_name;
            const phoneNumber = data.phone;
            const category = data.category_name.split(" ")[2];
            const x = Number(data.x);
            const y = Number(data.y);
            const distance = Number(data.distance);

            try{
                const store = await database.store.create({
                    data:{
                        name:name,
                        address:address,
                        phoneNumber:phoneNumber,
                        category:category,
                        x:x,
                        y:y,
                        distance:distance,
                        campersId:campersId,
                    },
                    
                })
                await getPlaceId(phoneNumber,store.id);
            }catch(err){}
        }
        );
    })
}

const getPlaceId = async (phone,storeId) => {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${phone}&inputtype=textquery&key=${process.env.googleKey}`;
    const response = await axios.get(url);
    if(response.data.candidates.length>0){
        const id = response.data.candidates[0].place_id;
        await database.store.update({
            where:{
                id:storeId,
            },
            data:{
                place_id:id,
            }
        })
        await getDetail(id,storeId);
    }
}


const getDetail = async (place_id,storeId) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${process.env.googleKey}`;
    await axios.get(url)
    .then(async (response)=>{
        if(response.data.result.hasOwnProperty('photos')){
            const photo = response.data.result.photos[0].photo_reference;
           
            await database.store.update({
                where:{
                    id:storeId,
                },
                data:{
                    imageUrl:photo,
                }
            });
        };
        let timeText;
        if(response.data.result.hasOwnProperty('current_opening_hours')){
            if(response.data.result.current_opening_hours.hasOwnProperty('weekday_text')){
                timeText = response.data.result.current_opening_hours.weekday_text;
            }
        }
        else if(response.data.result.hasOwnProperty('opening_hours')){
            if(response.data.result.opening_hours.hasOwnProperty('weekday_text')){
                timeText = response.data.result.opening_hours.weekday_text;
            }
        }
        let time = [];
        
        if(timeText){
            timeText.map((date)=>{
                const tmp = date.split(' ');
                const text = tmp[1];
                if(text==="Closed"){
                    time.push(["0:00","0:00"]);
                }
                else if(text==="Open"){
                    time.push(["0:00", "23:59"]);
                }
                else if(tmp.length===2){
                    const dividedText = text.split(' – ');
                    const openClose = dividedText.map((time)=>{
                        if(time.substring(time.length-2,time.length)==="PM"){
                            const hour = Number(time.substring(0,time.length-6))+12;
                            const minute = time.substring(time.length-6,time.length-3);
                            return hour+minute;
                        }
                        else if(time.substring(time.length-2,time.length)==="AM"){
                            return time.substring(0,time.length-3);
                        }
                        else{
                            return time;
                        }
                    });
                    time.push(openClose);
                }
                else if(tmp.length===3){
                    const dividedText = [text.split(' – ')[0],tmp[2].split(' – ')[1]];
                    const openClose = dividedText.map((time)=>{
                        if(time.substring(time.length-2,time.length)==="PM"){
                            const hour = Number(time.substring(0,time.length-6))+12;
                            const minute = time.substring(time.length-6,time.length-3);
                            return hour+minute;
                        }
                        else if(time.substring(time.length-2,time.length)==="AM"){
                            return time.substring(0,time.length-3);
                        }
                        else{
                            return time;
                        }
                    });
                    time.push(openClose);
                }
            });
            await database.businessHour.create({
                data:{
                    store:{
                        connect:{
                            id:storeId,
                        }
                    },
                    monOpen:time[0][0],
                    monClose:time[0][1],
                    tueOpen:time[1][0],
                    tueClose:time[1][1],
                    wedOpen:time[2][0],
                    wedClose:time[2][1],
                    thuOpen:time[3][0],
                    thuClose:time[3][1],
                    friOpen:time[4][0],
                    friClose:time[4][1],
                    satOpen:time[5][0],
                    satClose:time[5][1],
                    sunOpen:time[6][0],
                    sunClose:time[6][1],
                }
            })
        }
    })
}
