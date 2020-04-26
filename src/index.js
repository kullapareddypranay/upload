const express=require('express')
require('./database/mongoose')
const userrouter=require('./routers/user')


const app=express()

const port=process.env.PORT || 3000




app.use(express.json())
app.use(userrouter)



app.listen(port,()=>{
    console.log('server is up on port '+port)
})
