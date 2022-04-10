import { MongoClient } from 'mongodb';
import fs from 'fs/promises';
import { zad1 } from './req/zapytanie_zad1.js';
import { zad2 } from './req/zapytanie_zad2.js';
import { zad3 } from './req/zapytanie_zad3.js';
import { zad4 } from './req/zapytanie_zad4.js';
import { zad5 } from './req/zapytanie_zad5.js';

const uri =
  'mongodb://root:example@localhost:27017?retryWrites=true&writeConcern=majority';

const run = async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();

    const db = client.db('nbd');
  
    //await init(db);

    const funs = [zad1, zad2, zad3, zad4, zad5];

    const promises = funs.map((f, i) => [f(db), i]).map(async tuple => {
      const [promise, i] = tuple;
      const result = await promise;
      await fs.writeFile(`resp/wyniki_${i + 1}_A.json`, JSON.stringify(result[0]));
      return fs.writeFile(`resp/wyniki_${i + 1}_MR.json`, JSON.stringify(result[1]));
    });

    await Promise.all(promises);

  } finally {
    await client.close();
  }
};

run();

async function init(db) {
  const content = await fs.readFile('cwiczenia2.json');
  const people = JSON.parse(content);

  return await db.collection('people').insertMany(people);
}
