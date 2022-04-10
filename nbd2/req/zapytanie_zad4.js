export async function zad4(db) {
  const people = db.collection('people');
  return [await pipeline(people), await mr(db)];
}

async function pipeline(people) {
  const bmi = {
    $divide: [ 
      { $toDouble: '$weight' },
      { $pow: [ { $divide: [ { $toDouble: '$height' }, 100 ] } , 2] }
    ]
  };

  const curosr = people.aggregate([{
    $group: {
      _id: '$nationality',
      avgBmi: { $avg: bmi },
      minBmi: { $min: bmi },
      maxBmi: { $max: bmi }
    }
  }]);
  const selected = await curosr.toArray();
  curosr.close();
  return selected;
}

async function mr(db) {
  const outCollName = 'zad4_mr_result';
  function mapFn() {
    const height = parseFloat(this.height);
    const weight = parseFloat(this.weight);

    const bmi = weight / Math.pow((height / 100), 2);

    emit(this.nationality, {
      count: 1,
      sum: bmi,
      min: bmi,
      max: bmi
    });
  }
  function reduceFn(key, values) {
    return values.reduce((acc, n) => {
      return {
        count: acc.count + n.count,
        sum: acc.sum + n.sum,
        min: n.min < acc.min ? n.min : acc.min,
        max: n.max > acc.max ? n.max : acc.max
      };
    });
  }
  function finalizeFn(key, value) {
    return {
      avgBmi: value.sum / value.count,
      minBmi: value.min,
      maxBmi: value.max
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