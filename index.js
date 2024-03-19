const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const methodOverride = require("method-override");

app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

const connection = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   database: 'farmconnect',
   password : 'My307438'
 });

app.get("/main",(req,res)=>{
   res.render("index.ejs");
});

app.get("/login",(req,res)=>{
   res.render("login.ejs");
});

app.post("/login/",(req,res)=>{
   let { username : loginUser, password : loginPass } = req.body;
   let q = `SELECT * FROM user WHERE password = "${loginPass}" AND name = "${loginUser}"`;
    try{
     connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];
        if(user){
        res.render("main.ejs",{ user });
        }
        else{
         res.render("error.ejs");
        }
      });
    }
    catch(err){
       res.send("Error in DB");
    }
});

app.get("/signup",(req,res)=>{
   res.render("signup.ejs");
});
app.post("/signup/",(req,res)=>{
    let id = uuidv4();
    let { email , phone , username , password } = req.body;
    let q = `INSERT INTO user (id, email, phone_no , name , password) VALUES (?,?,?,?,?)`;
    let data = [id, email, phone, username, password ];
    try{
     connection.query(q,data,(err,result)=>{
        if(err) throw err;
        res.redirect("/login");
      });
    }
    catch(err){
       console.log(err);
       res.send("Some error in DB");
    }
});

app.get("/login/:id/create",(req,res)=>{
   let { id } = req.params;
   let q = `SELECT * FROM user WHERE id = "${id}"`;
    try{
        connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];
        if(user){
        res.render("create.ejs",{ user });
        }
        else{
         res.render("error.ejs");
        }
        });
       }
       catch(err){
       res.send("Error in DB");
       }
});

app.post("/login/:id/create/posts",(req,res)=>{
   let { id } = req.params;
   let showAllPosts = ()=>{
      allPosts(id,res);
   }
   let { content } = req.body;
   let q = `SELECT name FROM user WHERE id = "${id}"`;
    try{
     connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];
        if(user){
         let postId = uuidv4();
         let q2 = `INSERT INTO posts (id ,postId, name , content) VALUES (?,?,?,?)`;
         let data = [id,postId, user.name, content];
         try{
          connection.query(q2,data,(err,result)=>{
             if(err) throw err;
             showAllPosts();
            });
         }
         catch(err){
            console.log(err);
            res.send("Some error in DB");
         }
         }
         else{                          
          res.render("error.ejs");
         }
         });
      }
      catch(err){
       res.send("Error in DB");
      }
});
  let allPosts = (id,res)=>{
            let q = `SELECT * FROM posts`;
             try{
             connection.query(q,(err,result)=>{
             if(err) throw err;
             let posts = result;
             if(posts){
             res.render("posts.ejs",{posts , id});
             } else{
               res.render("error.ejs");
             }
            });
            }
            catch(err){
            res.send("Error in DB");
            }
  }

app.get("/login/:postId/:id/posts",(req,res)=>{
   let { postId, id} = req.params;
   let q = `DELETE FROM posts WHERE postId = "${postId}"`;
    try{
        connection.query(q,(err,result)=>{
        if(err) throw err;
        let q2 = `SELECT * FROM posts`;
        try{
        connection.query(q2,(err,result)=>{
        if(err) throw err;
        let posts = result;
        if(posts){
        res.render("posts.ejs",{posts , id});
        } else{
          res.render("error.ejs");
        }
       });
       }
       catch(err){
       res.send("Error in DB");
       }
        });
       }
       catch(err){
       res.send("Error in DB");
       }
});



app.listen("8080",()=>{
    console.log("listening to port 8080");
});