import express from "express"
import path from "path"
import mongoose from "mongoose";
import { name } from "ejs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const app=express();

mongoose.connect("mongodb://localhost:27017",{
    dbName:"backend",
}).then(()=>console.log("connected to datbase"))
.catch(()=>console.log("oops!! Error"))

app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended: true}))

app.set("view engine" , "ejs");
const users=[]
app.use(cookieParser())

const userschema= new mongoose.Schema({
name:String,
email:String,
password:String,
})

const isauth= async(req,res,next)=>{
    const {token}=req.cookies;
    if(token){
        const decode=jwt.verify(token,"devpaldanji")
        req.user=await User.findById(decode._id)
   next();
    }
    else{
       res.render("login")
    }
    res.render("login");
}

const User=mongoose.model("User", userschema)

app.get('/', isauth, (req, res)=> {
    // console.log(req.cookies)
   res.render("logout",{name:req.user.name});
    });



app.get("/logout",(req,res)=>{
    res.cookie("token",null, {
        expires:new Date(Date.now()),
    });
    res.redirect('/')
})

app.get("/register",(req,res)=>{
    
    res.render("register");
})

app.get("/login",(req,res)=>{
    
    res.render("login");
})

app.post("/login",async(req,res)=>{
    const{email,password}=req.body

    let user= await User.findOne({email})

    if(!user){
        return res.redirect("/register")
    }

    const ismatch = await bcrypt.compare(password,user.password)
    if(!ismatch){
        return res.render("login",{email,message:"Wrong Password"})
    }
    const token=jwt.sign({_id : user._id},"devpaldanji")
    res.cookie("token",token,{
        httpOnly: true,
    })
    res.redirect('/')
    

})

app.post("/register",async(req,res)=>{
const {name,email,password}=req.body
const hashpassword= await bcrypt.hash(password,10);
let user=await User.findOne({email})
if(user){
    return res.redirect('/login')
}
 user= await User.create({
    name,
    email,
    password:hashpassword,
})
const token=jwt.sign({_id : user._id},"devpaldanji")
    res.cookie("token",token,{
        httpOnly: true,
    })
    res.redirect('/')
})




app.listen(3000, ()=>{
    console.log("or bhaaai");
});