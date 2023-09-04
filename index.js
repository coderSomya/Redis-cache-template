import express from 'express'
import fetch from 'node-fetch'; 
import redis from 'redis';

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);
await client.connect();

const app= express();
const url="https://api.github.com/users/"

function setResponse(username, repos){
  return `<h2>${username} has ${repos} repos</h2>`;
}

async function getRepos(req,res, next){
   try {
    console.log("fetching data");
    const {username} = req.params;
    const response= await fetch (`${url}${username}`);
    const data = await response.json();
    const repos= data.public_repos;

    //cache
    client.setEx(username,3600,repos);
    res.send(setResponse(username, repos));
   } catch (error) {
    console.log(error);
    res.status(500)
   }
}

//cache middleware

function cache(req, res, next){
  const {username} = req.params;
   
  client.get(username, (err, data)=>{
   if(err) throw err;
   if(data !==null){
    res.send(setResponse(username, data));
   }
   else next();
  });
}

app.get('/repos/:username', cache, getRepos);

app.listen(PORT, ()=> {
  console.log("App is listening");
})