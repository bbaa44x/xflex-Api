import { readFileSync } from "node:fs"
import CustomError from "../util/myError.js";

export const checkIfExistsMiddleWare = (req,res,next)=>
{
    console.log("check exits reached");
    try {
const {email}=req.body
const file =readFileSync("data/users.json","utf-8");
const users = JSON.parse(file);
const user = users.find((user)=>user.email==email);
if(user)
{
    throw new CustomError("user already exists");
}
return next();
    } catch (error) {
        if(error instanceof CustomError)
        {
             res.status(400).json({
                success:false,
                body:{
                    payload:null,
                    message:"couldn't sign up"
                },
                errors:[error.message]
            })
        }
        else 
        {
            return res.status(500).json({
                success:false,
                body:{
                    payload:null,
                    message:"couldn't sign up something went wrong please try again later",
                },
                errors:[]
            })
        }
    }
    
}
