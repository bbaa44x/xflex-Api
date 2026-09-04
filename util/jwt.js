import jsonWebToken from "jsonwebtoken";
import CustomError from "./myError.js";


const options = {
    "expiresIn":"3h",
}

const secret = "xflex_Secret";

export const generateToken = (payload)=>
{
    const token = jsonWebToken.sign(payload,secret);
    return token;
}

export const validateToken=(token)=>
{
    try {
       const payload= jsonWebToken.verify(token,secret);

        return true
    } catch (error) {
        throw new CustomError(error.message);
        return false;
    }
    
}