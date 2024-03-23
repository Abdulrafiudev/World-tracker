import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Pythondev",
  port: 5433
})

db.connect()

async function countries_visited(){
  let response = await db.query("SELECT country_code FROM visited_countries")
  let visited_countries = response.rows
  let countries = []
  visited_countries.forEach((country) => {
     countries.push(country.country_code)
  })
  return countries
}

app.get("/", async (req, res) => {
  //Write your code here.
  
  let countries = await countries_visited()
  console.log(countries)
  console.log(countries.length)
  res.render("index.ejs", {country: countries, length: countries.length})
  
});

app.post(`/add`, async (req, res) => {
  let country_input = req.body.country
  console.log(country_input)
  try{
    let response = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';", [country_input.toLowerCase()]);
    let result = response.rows
    console.log(result)
    // The error will occur if they isnt a match with the countries in the database and will go the the error handler with is the CATCH keyword when trying to access an empty objects property
    let new_country = result[0]

    console.log(new_country)
    
    let country_new = new_country.country_code

    try{
      if (result.length !==0){
        await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [country_new])
       
        res.redirect(`/`)
      }
    }
    catch(error){
      console.error(`No matched countries`, error.message)
      let countries = await countries_visited()
      res.render("index.ejs", {country: countries, length: countries.length, error: `Country has already been added, try again.`})
    }

    
  }
  
  catch(error){
    console.error(`No matched countries`, error.message)
    let countries = await countries_visited()
    res.render("index.ejs", {country: countries, length: countries.length, error: `Country name does not exist, try again.`})


  }  
  
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
