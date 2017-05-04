Run-book
========

## build the project:
```
% ./make.js --silent install localhost
```	

## localhost and localnet 
Start mongo db:
```
% pushd ~/mongowrk/ ; nohup mongod & popd
```

## Run Todo server on localhost:
```
% cd ./build ; node ./todoServer.js & cd ..
```

## Connect to mongod with repl interface:
```
% mongo
```

## Create new DBs for to be assigned to users:
- Use the admin interface of your hosting provider or clonedb or mongodump and mongorestore to create or copy an empty db. Note the mongo connection string. Looks something like: ```ds047057.mongolab.com:47057/frankstodos```
- Create the user in the DB for authentication. Must be the same user and password of every db.
- Test the auth by connecting like:
```
% mongo -u <user> -p <password> ds043972.mongolab.com:43972/users
MongoDB shell version: 3.0.1
connecting to: ds043972.mongolab.com:43972/users
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
% now
% now alias set https://reminders-kevovklwel.now.sh reminders
```

## Environment Variables and Secrets
These are required for security credentials in production.
```
NODE_ENV = {production|dev}
MONGO_USER = <dbUserName>
MONGO_USER_SECRET = <dbUserSecret>
GOOGLE_CLIENT_SECRET = <googleClientSecret>
GOOGLE_CLIENT_ID = <googleClientId>
LOG_LEVEL = {fatal|error|warn|info|debug|trace}
```
Zeit supports a ```secret``` command to add and name secrets. Then set environment variables to refernce a secret as follows.
```
$ now secrets add my-secret "my value"
$ now -e MY_SECRET=@my-secret
```

The MONGO variables depend on the userDbName in build_props.
The GOOGLE variables are always required at run-time. They are only used when NODE_ENV=production.
NODE_ENV=production only works in 127.0.0.1 and cloud deployment.
LOG_LEVEL is the level from bunyan logger to log at and above.

## Testing google auth on loopback (127.0.0.1)

Use build_prop.127.json and set the NODE_ENV to production to test google auth on loopback.

```
% export NODE_ENV=production
% ./make.js --silent install 127
% cd ./build ; node ./todoServer.js ; cd ..
Todo Server v0.4.3
Running on mikes-air.local:8080
Node environment = PROD
User store = localhost:27017/users[userList]
Use http://127.0.0.1:8080
CTRL + C to shutdown
i  email     	  db
0 bob@example.com	localhost:27017/bobstodos
1 test@example.com	localhost:27017/test-todo
2 frank@example.com	localhost:27017/todos-for-frank
3 yoderm01@gmail.com	localhost:27017/yodertvtodo
4 yodercode@gmail.com	localhost:27017/todo_new_test

```
