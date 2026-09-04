import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { validateMiddleWare } from "./middlewares/validateMiddleware.js";
import { readFileSync, writeFileSync } from "node:fs";
import { sendEmail } from "./util/nodeMailer.js";
import { generateToken, validateToken } from "./util/jwt.js";
import CustomError from "./util/myError.js";
import {checkIfExistsMiddleWare} from "./middlewares/checkIfExists.js";
import * as dotenv from "dotenv"
import * as cookie from "cookie"
dotenv.config();
const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://wnw0vh57-5173.uks1.devtunnels.ms"
];


app.use(cors({
    origin:["https://wnw0vh57-5173.uks1.devtunnels.ms","http://localhost:5173"],
    credentials:true,
    
}))
app.use(express.json());
app.use(cookieParser())
app.listen(process.env.PORT ?? 4000,"0.0.0.0",()=>
{
    console.log("server is running on 3000");
})


app.get("/",(req,res)=>
{
    res.status(200).json({
        Succsess:true,
        body:{
            payload:null,
            message:"welcome from user"
        },
        errors:[]
    })
})


app.post("/signUp",validateMiddleWare,checkIfExistsMiddleWare,(req,res)=>
{   console.log("sign up reached");
    const {email,password,confirmPassword}=req.body;
    try {
        const read = readFileSync("data/users.json",{encoding:"utf8",flag:"r"});
        const users = JSON.parse(read)
        const verficationCode= Math.floor(100000+Math.random()*(9*10**5));
        users.push({email,password,confirmPassword,verficationCode})
         writeFileSync("data/users.json",JSON.stringify(users));
         sendEmail(`${email}`,`thank you for using xflex your verfication code is ${verficationCode}`);
        return res.status(201).json({
            success:true,
            body:{
                payload:null,
                message:"user have been created and an email has been sent to the user",
            },
            errors:[],
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            body:{payload:null,message:"coudln't create user please try again "},
            erorrs:[error]
        })
    }
})

app.post("/signUp/:email",(req,res)=>
{

    try{
    const {verficationCode}=req.body;
    const {email}=req.params;
    const file = readFileSync("data/users.json","utf-8");
    const users = JSON.parse(file);
    const user = users.find(user =>{
        if(user.email == email && user.verficationCode==verficationCode)
        {
            return true
        }
        return false;
    })
    if(!user)
    {
        throw new CustomError("couldn't verify the user sign up and try again..");
    }

    const token = generateToken({email:`${email}`});
   return  res.cookie("token",token,{httpOnly:true,secure:false,sameSite:"strict"}).status(202).json({
        success:true,
        body:{
            payload:null,
            message:"you have been authenticated"
        },
        errors:[]
    })
        
    } catch (error) {
        
        if(error instanceof CustomError)
        {
            return res.status(400).json({
                success:false,
                body:{
                    payload:null,
                    message:"couldn't authenticate user"
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
                    message:"something went wrong please try again later.."
                },
                errors:[error.message],
            })
            
            
        }

    }
})


app.post("/signIn",validateMiddleWare,(req,res)=>
{   
    const {email,password}=req.body

    try {
        const file = readFileSync("data/users.json","utf-8");
        const users = JSON.parse(file);
        const userExist = (users.find(user=>(user.email==email))!=undefined)
       
        if(!userExist)
        {
            throw new CustomError("couldn't find user please sign up ");
        }

        const isValid =(users.find(user=>(user.email==email && user.password == password))!=undefined)
        if(!isValid)
        {
            throw new CustomError("email or password is invalid");
        }
    
        const token = generateToken({email});
        return res.cookie("token",token,{httpOnly:true,secure:false,sameSite:"strict"}).status(201).json({
            success:true,
            body:{
                payload:null,
                message:"user authenticated",

            },
            errors:[]
        })
    } catch (error) {
        if(error instanceof CustomError)
        {
            return res.status(401).json({
                success:false,
                body:{
                    payload:null,
                    message:"couldn't authenticate user please try again"
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
                    message:"something went wrong please try again",
                },
                errors:[error.message]
            })
        }
    }
})


app.get("/verify",(req,res)=>{
    try {
         const {token}=req.cookies;
        console.log(token);
    const isValid = validateToken(token);
    return res.status(200).json({
        success:true,
        body:{
            payload:null,
            message:"you are verifed"
        },
        errors:[]
    })
    } catch (error) {
        if(error instanceof CustomError)
        {
            return res.status(401).json({
                sucess:false,
                body:{
                    payload:null,
                    message:"this token is invalid sign In to take a new token"
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
                    message:"something went wrong please try again later"
                },
                errors:[error.message]
            })
        }
    }
 
})


app.get("/logOut",(req,res)=>{
    try {
        const {token}=req.cookies;
        if(!token)
        {
            throw new CustomError("you are not signed in !");
        }
        return res.clearCookie("token").status(200).json({
            success:true,
            body:{
                payload:null,
                message:"you have been logged out"
            },
            errors:[]
        })
    } catch (error) {
        if(error instanceof CustomError)
        {
            return res.status(400).json({
                success:false,
                body:{
                    payload:null,
                    message:"couldn't log you out try again later"
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
                    message:"something went wrong"
                },
                errors:[error.message]
            })
        }
    }
})



app.get("/signUp/verify/:email",(req,res)=>
{
    try {
        const {email} = req.body;
        const file = readFileSync("data/users.json","utf-8");
        const write = writeFileSync('data/user.json');
        const users = JSON.parse(file);
        const user = users.find(user=>user.email == email);

        if(!user || !user.verficationCode)
        {
            throw new CustomError("couldn't find the user ");
        }

        return res.status(200).json({
            sucess:true,
            body:{
                payload:null,
                message:"user found"
            },
            errors:[]
        })


    } catch (error) {
        if(error instanceof CustomError)
        {
           return res.status(404).json({
                sucess:false,
                body:{
                    payload:null,
                    message:"didn't find the user!"
                },
                errors:[error.message]
            })
        }
        else 
        {
            return res.status(500).json({
                sucess:false,
                body:{
                    payload:null,
                    message:"something went wrong please try again later"
                },
                error:[error.message]
            })
        }
    }
})