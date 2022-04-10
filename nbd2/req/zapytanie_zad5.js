export async function zad5(db) {
  const people = db.collection('people');
  return [await pipeline(people), await mr(db)];
}


async function pipeline(people) {
  const query = [
    {
      $match: { nationality: 'Poland', sex: 'Female' }
    },
    {
      $unwind: { path: '$credit' }
    },
    {
      $group: {
        _id: '$credit.currency',
        avgBalance: { $avg: { $toDouble: '$credit.balance' } },
        totalBalance: { $sum: { $toDouble: '$credit.balance' } }
      }
    }
  ];

  const curosr = people.aggregate(query);
  const selected = await curosr.toArray();
  curosr.close();
  return selected;
}

async function mr(db) {
  const outCollName = 'zad5_mr_result';
  function mapFn() {
    this.credit.forEach(credit => {
      emit(credit.currency, {
        count: 1,
        sum: parseFloat(credit.balance)
      });
    });
  }
  function reduceFn(key, values) {
    return values.reduce((acc, n) => {
      return {
        count: acc.count + n.count,
        sum: acc.sum + n.sum
      };
    });
  }
  function finalizeFn(key, value) {
    return {
      avgBalance: value.sum / value.count,
      totalBalance: value.sum,
    };
  }

  await db.collection('people').mapReduce(
    mapFn,
    reduceFn,
    {
      out: outCollName,
      query: { nationality: 'Poland', sex: 'Female' },
      finalize: finalizeFn
    }
  );

  const selected = await db.collection(outCollName).find().toArray();
  return selected;
}