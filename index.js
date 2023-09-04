import express from 'express'
import fetch from 'node-fetch'; 
import redis from 'redis';

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app= express();
const url="https://api.github.com/users/"

async function getRepos(req,res, next){
   try {
    console.log("fetching data");
    const {username} = req.params;
    const response= await fetch (`${url}${username}`);
    const data = await response.json();
    const repos= data.public_repos;
    res.send(data);
   } catch (error) {
    console.log(err);
    res.status(500)
   }
}

app.get('/repos/:username', getRepos);

app.listen(PORT, ()=> {
  console.log("App is listening");
})