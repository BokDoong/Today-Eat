import fs from "fs";
import path from "path";

export const writeTimeLog = async () => {
  const curr = new Date();
  
  const utc = 
        curr.getTime() + 
        (curr.getTimezoneOffset() * 60 * 1000);
  
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const kr_curr = 
        new Date(utc + (KR_TIME_DIFF)).toLocaleString();

  fs.appendFile(path.resolve('./log','rankUpdateLog.txt'),kr_curr+"\n", (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(kr_curr, '랭킹 갱신 완료!')
    }
  });
}