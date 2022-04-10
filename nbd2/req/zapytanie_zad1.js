export async function zad1(db) {
  const people = db.collection('people');
  return [await pipeline(people), await mr(db)];
}

async function pipeline(people) {
  const curosr = people.aggregate([
    {
      $group: {
        _id: '$sex',
        avgWeight: { $avg: { $toDouble: '$weight' } },
        avgHeight: { $avg: { $toDouble: '$height' } },
      }
    }
  ]);
  const selected = await curosr.toArray();
  curosr.close();
  return selected;
}

async function mr(db) {
  const outCollName = 'zad1_mr_result';
  function mapFn() {
    emit(this.sex, {
      count: 1,
      height: parseFloat(this.height),
      weight: parseFloat(this.weight)
    });
  }
  function reduceFn(key, values) {
    return values.reduce((acc, n) => {
      return {
        count: acc.count + n.count,
        height: acc.height + n.height,
        weight: acc.weight + n.weight
      };
    });
  }
  function finalizeFn(key, value) {
    return {
      avgWeight: value.weight / value.count,
      avgHeight: value.height / value.count,
    };
  }

  await db.collection('people').mapReduce(
    mapFn,
    reduceFn,
    {
      out: outCollName,
      finalize: finalizeFn
    }
  );

  const selected = await db.collection(outCollName).find().toArray();
  return selected;
}