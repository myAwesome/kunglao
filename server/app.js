const dotenv = require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./dbConnection')

const app = express()

//CORS
app.use(cors({credentials: true, origin: true}))

app.use(express.json())

app.post('/filter-unknown',async (req,res) => {
  const incomingWords = req.body;
  const temporaryTableName = `t_${+ new Date()}`;
  await sequelize.query(`CREATE TABLE eng.${temporaryTableName} ( name varchar(255) NOT NULL, PRIMARY KEY (name));`);
  await sequelize.query(`INSERT INTO eng.${temporaryTableName} (name) VALUES ${incomingWords.map((w)=>  `('${w}')`)};`);
  await sequelize.query(`delete from eng.${temporaryTableName} where name in  (SELECT name from eng.ignore)`);
  await sequelize.query(`delete from eng.${temporaryTableName} where name in  (SELECT eng FROM eng.word where meaning is true)`);
  await sequelize.query(`delete from eng.${temporaryTableName} where name in  (SELECT name FROM eng.variant v  join eng.word w  on v.word = w.id  where w.meaning is true)`);
  const [filtered] = await sequelize.query(`SELECT * FROM eng.${temporaryTableName};`);
  await sequelize.query(  `drop table eng.${temporaryTableName};`);

  res.json(filtered.map(slovo=>slovo.name));
})

app.get('/ping',async (req,res) => {
  res.json(["hello", "war", "is", "over" ]);
})

app.post('/ignore',async (req,res) => {
  console.log(req.body)
  await sequelize.query(`INSERT IGNORE INTO eng.\`ignore\` (name) VALUES ('${req.body.word}');`);
  res.json("done");
})





const PORT = process.env.PORT || 8080

app.listen(PORT,() => {
  console.log(`Server running on http://localhost:8080`);
})