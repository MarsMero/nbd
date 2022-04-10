export async function zad3(db) {
  const people = db.collection('people');
  return [await pipeline(people), await mr(db)];
}

async function pipeline(people) {
  const group = {
    $group: {
      _id: '$job'
    }
  }
  const curosr = people.aggregate([group]);
  const selected = await curosr.toArray();
  curosr.close();
  return selected;
}

async function mr(db) {
  const outCollName = 'zad3_mr_result';
  function mapFn() {
    emit(this.job, null);
  }
  function reduceFn(key, values) {
    return null;
  }

  await db.collection('people').mapReduce(
    mapFn,
    reduceFn,
    {
      out: outCollName,
    }
  );

  const selected = await db.collection(outCollName).find().project({ value: 0}).toArray();
  return selected;
}