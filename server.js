const mongoose=require('mongoose');
const Tour=require('./dev-data/models/tourSchema');
const dotenv=require('dotenv');
dotenv.config({path:'./config.env'});
const rateLimit=require('express-rate-limit');

const app=require('./index');


mongoose.connect(process.env.DATABASE,{

}).then(()=>{
  console.log("Connected To database");
}).catch(err=>{
  console.log(err);
});

app.listen(process.env.PORT, (req, res) => {
    console.log(`server started at ${process.env.PORT}`);
  });


  process.on('unhandledRejection',(err)=>{
    console.log(err.message,err.name);
    console.log('unhandeled Rejections ! Shutting Down...');
    app.close(()=>{
      process.exit(1);
    })
  })

  process.on('unhandledException',(err)=>{
    console.log(err.message,err.name);
    console.log('unhandeled Exception ! Shutting Down...');
    app.close(()=>{
      process.exit(1);
    })
  })
  
  
 
  