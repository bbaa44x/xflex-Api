import * as z from "zod"
const validateFormatching = z.function({
    input:[z.string(),z.string()],
    output:z.boolean()
})
const userSchema = z.object({
    email: z.string({
        message:"invalid email",
    }).email(
        {
            message:"invalid email",
        }
    ),
    password: z.string().min(8,{
        message:"password is invalid",
    }),
    confirmPassword:z.string().optional()
}).refine((data)=>{
        if(data.confirmPassword === undefined)
            return true
        
        if(data.password == data.confirmPassword)
            return true
        else 
        {
            return false
        }
    }
    ,{message:"Passwords don't match",path:['comfirmPassword']})

export const validateMiddleWare = (req,res,next)=>

{   console.log("validate middleware reached");
    
    const {email,password,confirmPassword} = req.body
   const result =userSchema.safeParse({email,password,confirmPassword});
    if(!result.success)
    {   
        return res.status(401).json({
            success:false,
            body:{
                payload:null,
                message:"invalid data please enter valid data",
            },
            errors:result.error.issues.map(issue=>issue.message)
        })
    }
    else{
      return  next();
    }

}