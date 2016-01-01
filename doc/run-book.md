# run-book.md

## localhost and localnet 
Start mongo db:
```
% pushd ~/mongowrk/ ; nohup mongod & popd
```

Run Todo server:
```
% cd ./build ; node ./todoServer.js & cd ..
```

Connect to mongod with repl interface:
```
% mongo
```
Create new DBs:
- Copy an existing template using dump and restore.
- Commands are documented in README.md of project testMongo.

## deploy to modulus
```
% modulus project create
```

from build directory
```
% modulus deploy todos -p "Todos"
```

Environment variables required for security credentials in production:
```
Kats-Air:todo mike$ modulus env list -p <modulus project>
Welcome to Modulus
You are logged in as <user>
Selecting <modulus project>

Project <modulus project> Environment Variables
NODE_ENV = {production|dev}
MONGO_USER = <dbUserName>
MONGO_USER_SECRET = <dbUserSecret>
GOOGLE_CLIENT_SECRET = <googleClientSecret>
GOOGLE_CLIENT_ID = <googleClientId>
Kats-Air:todo mike$
```


