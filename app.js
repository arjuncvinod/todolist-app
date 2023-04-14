const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const date = require(__dirname + "/date.js");

const _=require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];

// const workItems = [];

// mongoose.connect("mongod://localhost:27017/todolistDb",{useNewUrlParser: true});

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    "mongodb+srv://arjuncvinod:Arjuncvinod%40123@arjun.advry0c.mongodb.net/todoListDB?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );
  }
const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const ListSchema={
  name:String,
  items:[itemSchema]
};

const List=new mongoose.model("List",ListSchema);


let day;
app.get("/", function (req, res) {
day = date.getDate();

  Item.find(function (err, results) 
  {
      if(results.length===0)
        {
         Item.insertMany(defaultItems, function (err) 
            {
              if (err) 
              {
                console.log(err);
              } 
              else 
              {
              console.log("Successfully saved all the items to Db");
              }
            })
          res.redirect("/")
         }
      else
        {
          res.render("list", { listTitle: day, newListItems: results });
        }
  });

  
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  console.log("hi"+req.body.list);
  const item = new Item({
    name:itemName
  })
   if(listTitle===day){
  item.save();
  res.redirect("/")
}else{
  List.findOne({name:listTitle},function(err,foundList){
    foundList.items.push(item) 
    foundList.save()
    res.redirect("/"+listTitle)
  })
}
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});

app.post("/delete",function(req,res){
  const listTitle=req.body.listTitle;
  const itemid=req.body.checkbox;
  if(listTitle===day){
  Item.findByIdAndRemove(itemid,(err)=>{
    console.log("deleted");
    res.redirect("/")
  })}
  else{
    List.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:itemid}}},function(err,result){
      if(!err){
        res.redirect("/"+listTitle);
      }
    });
  }
});

app.get("/:customRoute",(req,res)=>{
const customRoute=_.capitalize(req.params.customRoute);

    

  List.findOne({name:customRoute},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customRoute,
          items: defaultItems,
        });
        list.save();  
        res.redirect("/"+customRoute)
      }else{
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        
      }
    }
  });
      
      });
