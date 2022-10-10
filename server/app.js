'use strict';

const express = require('express');
const cors = require('cors');
const sequelize = require('./dbConnection');
const inflection = require('inflection');

const app = express();

//CORS
app.use(cors({ credentials: true, origin: true }));

app.use(express.json());

app.post('/filter-unknown', async (req, res) => {
  const incomingWords = req.body;
  const temporaryTableName = `t_${+new Date()}`;
  await sequelize.query(`CREATE TABLE eng.${temporaryTableName} ( name varchar(255) NOT NULL, PRIMARY KEY (name));`);
  await sequelize.query(`INSERT INTO eng.${temporaryTableName} (name) VALUES ${incomingWords.map(w =>  `('${w}')`)};`);
  await sequelize.query(`delete from eng.${temporaryTableName} where name in  (SELECT name from eng.ignore)`);
  await sequelize.query(`delete from eng.${temporaryTableName} where name in  (SELECT eng FROM eng.word where meaning is true)`);
  await sequelize.query(`delete from eng.${temporaryTableName} where name in  (SELECT name FROM eng.variant v  join eng.word w  on v.word = w.id  where w.meaning is true)`);
  const [filtered] = await sequelize.query(`SELECT * FROM eng.${temporaryTableName};`);
  await sequelize.query(`drop table eng.${temporaryTableName};`);

  res.json(filtered.map(slovo => slovo.name));
});

app.get('/ping', (req, res) => {
  res.json(['hello', 'war', 'is', 'over' ]);
});

app.post('/ignore', async (req, res) => {
  const words = req.body.words;
  await Promise.allSettled(words.map(w => Promise.allSettled([
    sequelize
      .query(`INSERT IGNORE INTO eng.\`ignore\` (name) VALUES ('${w}');`)
  ])));
  res.json('done');
});

app.post('/know', async (req, res) => {
  const words = req.body.words;
  await Promise.allSettled(words.map(w => Promise.allSettled([
    w !== inflection.singularize(w) ? sequelize
      .query(`
      insert into word (eng, meaning) values ('${inflection.singularize(w)}', 1)
      on duplicate key update meaning = 1;
      `) : () => {
    },
    sequelize
      .query(`
    insert into word (eng, meaning) values ('${w}', 1)
    on duplicate key update meaning = 1;`),
  ])));
  res.json('done');
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log('Server running on http://localhost:8080');
});
