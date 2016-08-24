
# run-book.md

## build the project:
```
% ./make.js --silent install localhost
```	

## localhost and localnet 
Start mongo db:
```
% pushd ~/mongowrk/ ; nohup mongod & popd
```

## Run Todo server:
```
% cd ./build ; node ./todoServer.js & cd ..
```

## Connect to mongod with repl interface:
```
% mongo
```

## Create new DBs for to be assigned to users:
- Use the admin interface of your hosting provider or clonedb or mongodump and mongorestore to create or copy an empty db.
- Note the mongo connection string. Looks something like ds047057.mongolab.com:47057/frankstodos.
- Create the user in the DB for authentication. Must be the same user and password of every db.
- Test the auth by connecting like:
```
% mongo -u <user> -p <password> apollo.modulusmongo.net:27017/riZ2ezip
MongoDB shell version: 3.0.1
connecting to: apollo.modulusmongo.net:27017/riZ2ezip
mod-mongo-aws-east-1a:PRIMARY> 
```
- Connect to the user database and insert the new db into the userList collection as follows:
```
mod-mongo-aws-east-1a:PRIMARY> db.userList.insert({"email" : "UNASSIGNED_DB", "db" : "ds049467.mongolab.com:49467/bobstodos"})
WriteResult({ "nInserted" : 1 })
mod-mongo-aws-east-1a:PRIMARY>
```
- Restart the todoServer so it reads the updated user table.
```
% modulus project restart -p Todos
```

## deploy to modulus

build for modulus:
```
% ./make.js --silent install localhost
```	

Create a project on mondulus
```
% modulus project create
```

from build directory deploy by
```
% modulus deploy -p "Todos"
```

## Environment variables required for security credentials in production:
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
The MONGO variables depend on the userDbName in build_props.
The GOOGLE variables are always required at run-time. They are only used when NODE_ENV=production.
NODE_ENV=production only works in 127.0.0.1 and cloud deployment.

