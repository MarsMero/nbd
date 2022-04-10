import { MongoClient } from 'mongodb';

import fs from 'fs/promises';

const uri =
  "mongodb://root:example@localhost:27017?retryWrites=true&writeConcern=majority";

const run = async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();

    const db = client.db('nbd');
  
    const people = db.collection('people');
  
    //await init(people);

    const funs = [zad1, zad2, zad3, zad4, zad5, zad6, zad7, zad8, zad9, zad10];

    const promises = funs.map((f, i) => [f(people), i]).map(async tuple => {
      const [promise, i] = tuple;
      const result = await promise;
      return fs.writeFile(`out/wyniki_${i + 1}.json`, JSON.stringify(result));
    });

    await Promise.all(promises);

  } finally {
    await client.close();
  }
};

run();

async function init(collection) {
  const content = await fs.readFile('cwiczenia2.json');
  const people = JSON.parse(content);

  return await collection.insertMany(people);
}

async function zad1(people) {
  const person = await people.findOne();
  return person;
}

async function zad2(people) {
  const female = await people.findOne({sex: 'Female'});
  return female;
}

async function zad3(people) {
  const cursor = await people.find({nationality: 'Germany'});
  const germnas = await cursor.toArray();
  cursor.close();
  return germnas;
}

async function zad4(people) {
  const cursor = await people.find({weight: {$gte: '68', $lt: '71.5'}});
  const selected = await cursor.toArray();
  cursor.close();
  return selected;
}

async function zad5(people) {
  const query = { birth_date: { $gte: '2001-01-01T00:00.000Z' } };
  const options = { projection: { _id: 0, first_name: 1, last_name: 1, location: { city: 1 } } };
  const cursor = await people.find(query, options);
  const selected = await cursor.toArray();
  cursor.close();
  return selected;
}
async function zad6(people) {
  const result = await people.insertOne({
    sex: 'Male',
    first_name: 'Marcin',
    last_name: 'FakeSureName',
    job: 'Software Developer',
    email: 'fake@mail.pl',
    location: {
      city: 'Warsaw',
      address: {
        streetname: 'fake',
        streetnumber: '30'
      }
    },
    description: 'nothing interesting in particular',
    height: '179',
    weight: '75',
    birth_date: '1997-08-10T02:55:03Z',
    nationality: 'Poland',
    credit: []
  });
  return result;
}

async function zad7(people) {
  const result = await people.deleteMany({height: {$gt: '190'}});
  return result;
}

async function zad8(people) {
  const filter = { 'location.city': 'Moscow' };
  const update = { $set: { 'location.city': 'Moskwa' } };
  const result = await people.updateMany(filter, update);
  return result;
}

async function zad9(people) {
  const filter = { 'first_name': 'Antonio' };
  const update = { $set: { 'hobby': 'pingpong'} };
  const result = await people.updateMany(filter, update);
  return result;
}

async function zad10(people) {
  const filter = { 'job': 'Editor' };
  const update = { $unset: { 'email': '' } };
  const result = await people.updateMany(filter, update);
  return result;
}