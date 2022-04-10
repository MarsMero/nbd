
export async function zad2(db) {
  const people = db.collection('people');
  return [await pipeline(people), await mr(db)];
}

async function pipeline(people) {
  const unwind = {
    $unwind: {
      path: '$credit'
    }
  };
  const group = {
    $group: {
      _id: '$credit.currency',
      total: { $sum: { $toDouble: '$credit.balance' } }
    }
  };
  const curosr = people.aggregate([unwind, group]);
  const selected = await curosr.toArray();
  curosr.close();
  return selected;
}

async function mr(db) {
  const outCollName = 'zad2_mr_result';
  function mapFn() {
    this.credit.forEach(credit => {
      emit(credit.currency, parseFloat(credit.balance));
    });
  }
  function reduceFn(key, values) {
    return values.reduce((acc, n) => acc + n);
  }

  await db.collection('people').mapReduce(
    mapFn,
    reduceFn,
    {
      out: outCollName,
    }
  );

  const selected = await db.collection(outCollName).find().toArray();
  return selected;
}