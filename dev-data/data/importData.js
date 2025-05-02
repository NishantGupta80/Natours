
const mongoose=require('mongoose');
const fs=require("fs");
const Tour=require(`${__dirname}/../models/tourSchema`);
const User=require(`${__dirname}/../models/userModel`);
const review=require(`${__dirname}/../models/reviewModel`)

mongoose.connect("mongodb+srv://Nishant:Nishant7280@cluster0.gcddfex.mongodb.net/demo-Project?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log("Connected to dataBase");
}).catch((err)=>{
    console.log("internal Error");
})


const tourData=JSON.parse(fs.readFileSync("./tours.json",'utf-8'));
const UserData=JSON.parse(fs.readFileSync("./users.json",'utf-8'));
const ReviewData=JSON.parse(fs.readFileSync("./reviews.json",'utf-8'));

const deleteData= async ()=>{
    try{
         // await Tour.deleteMany();
          await User.deleteMany();
          //await review.deleteMany();
          
          console.log("data Deleted successfully");
    }catch(err)
    {
    console.log(err);
    }
    process.exit(); // so that our server can be closed after the data has been deleted because this small module is just for delete and importing
}

const importData = async () =>{
    try{
         //await Tour.create(tourData);
         await User.create(UserData,{validateBeforeSave:false});
        // await review.create(ReviewData);
         console.log("Data Imported Successfully");

    }catch(err)
    {
        console.log(err);
    }
    process.exit(); // so that our server can be closed after the data has been deleted because this small module is just for delete and importing
}

if(process.argv[2]=="import")
{
    importData();
}else if(process.argv[2]=="delete")
{
    deleteData();
}
 //console.log(process.argv);