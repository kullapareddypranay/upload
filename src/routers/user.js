const express=require('express')
const router=new express.Router()
const User=require('../models/user')
const auth=require('../middleware/auth')
const multer=require('multer')


router.post('/users',async (req,res)=>{

    const user=new User(req.body)
    try {
     await user.save()
     const token=await user.generateAuthToken()
     res.status(201).send({user,token})
    }catch(e){
     res.status(400).send(e)
    }
 
 })

 router.post('/users/login',async(req,res)=>{
     try{
         const user=await User.findByCredentials(req.body.email,req.body.password)
         const token=await user.generateAuthToken()
         res.send({user:user,token:token})

     }catch(e){
         res.status(400).send()
     }

 })

 router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()

        res.send('logouted')

    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send('logouted from all')
    }catch(e){
        res.status(500).send()
    }
})


 const upload =multer({
     limits:{
        fileSize:1000000
     },
     fileFilter(req,file,cb){
        if(! file.originalname.match(/\.(csv)$/)){
            return cb(new Error('upload csv'))
        }
        cb(undefined,true)
     }
 })

 router.post('/file',auth,upload.single('files'),async (req,res)=>{
     const files=req.file.buffer
     req.user.file=req.user.file.concat({files})
     await req.user.save()
     res.status(200).send()
 },(error,req,res,next)=>{
     res.status(400).send({error:error.message})
 })

 router.get('/file',auth,async (req,res)=>{
     try{
        const user=await req.user
         if(!user || !user.file){
             throw new Error()
         }
         res.set('Content-Type','text/csv')
         //res.send(user.file[0])
         user.file.forEach(element => {
             res.send(element.files)
         });
     }catch(e){
         res.status(400).send()
     }
 })

 router.get('/users/:id/file',async(req,res)=>{
     try{
         const user=await User.findById(req.params.id)
         if(!user || !user.file){
            throw new Error()
        }
        res.set('Content-Type','text/csv')
        res.send(user.file[0])
        
    }catch(e){
        res.status(400).send()
    }
 })

module.exports=router