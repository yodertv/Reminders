# run-book.md

## localhost and localnet 
Start mongo db:
pushd ~/mongowrk/ ; nohup mongod & popd

Run Todo server:
cd ./build ; node ./todoServer.js & cd ..

Connect to mongod with repl interface
mongo

Create new DBs:
- Copy an existing template using dump and restore.
- Commands are documented in README.md of project testMongo.

## deploy to modulus
modulus project create
from build directory
modulus deploy todos -p "Todos"
