import riak

# docker run --rm --network host -it -v $(pwd):/project python:2.7.18-slim-stretch /bin/bash

my_client = riak.RiakClient(pb_port=8087, protocol='pbc')

my_bucket = my_client.bucket('users')

some_value = {'email': 'martin@test.pl'}

some_key = my_bucket.new('martin', data=some_value)
some_key.store()

fetched = my_bucket.get('martin')
print(fetched.data)

fetched.data['epoch'] = 1655915661
fetched.store()

updated = my_bucket.get('martin')
print(updated.data)
updated.delete()

removed = my_bucket.get('martin')

print(removed.data)