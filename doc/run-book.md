Run-book
========

## build the project:
```
% npm run build <build environment>
```	

## deploy community mongodb locally:
- https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x-tarball/

```
tar -zxvf mongodb-macos-x86_64-7.0.tgz
sudo ln -s  /Users/mike/mongowrk/mongodb-macos-aarch64-7.0.14/bin/* /usr/local/bin/
```

## localhost and localnet 
Start mongo db:
```
% mongod --dbpath ~/mongowrk/data/db --logpath ~/mongowrk/data/log/mongo.log --fork
```

## Restore local db dump to Atlas:
```
% mongorestore --uri="mongodb+srv://cluster0.4swbu.mongodb.net/" --username=yodertv ./dump
```

## Run Todo server on vercel dev:
```
% vercel dev -l $PORT | bunyan --output oneline &
```

## Run Todo server on localhost:
```
% node main.js | bunyan --output oneline
```

## Connect to local deployment:
http://localhost:8080/

## Connect to mongod with repl interface:
```
% mongosh
```

## Environment Variables and Secrets
These are required for security credentials in production and ignored when in dev assuming test auth and credential free db.
Use vercel dashboard for IaaS deployments environment variables.
Use .env for vercel dev and main.js.
```
NODE_ENV = {production|dev}
MONGO_USER_DB_NAME = <UserDataBaseStore>
MONGO_USER = <dbUserName>
MONGO_USER_SECRET = <dbUserSecret>
GOOGLE_CLIENT_SECRET = <googleClientSecret>
GOOGLE_CLIENT_ID = <googleClientId>
LOG_LEVEL = {fatal|error|warn|info|debug|trace}
```
The MONGO variables apply to the MONGO_USER_DB_NAME.
The MONGO_USER_DB_NAME is the database for the user index collection, userList, which relates each user with the name of their mongo db name of the users Todo's. Each user has a db for their reminders. New users will be allocated new DBs on the same database server as MONGO_USER_DB_NAME.
The GOOGLE api variables are used for OAuth when NODE_ENV=production.
NODE_ENV=production only works in 127.0.0.1 and cloud deployment.
LOG_LEVEL is the level from bunyan logger to log at and above.

## Testing google auth on loopback (127.0.0.1)

Use build_prop.127.json and set the NODE_ENV to production to test google auth on loopback.
If you get the google auth button when NODE_ENV isn't production, check that you are using the correct url for your deployment.

```
% export NODE_ENV=production
% ./make.js --silent install 127
% cd ./build ; node ./todoServer.js ; cd ..
% mikes-air:Todos mike$ ~/src/node-bunyan/bin/bunyan -L --output short ./build/node.out
22:08:30.699  INFO todo: Todo Server v0.7.0 running on mikes-air.local:8080. Node environment = DEV.
22:08:30.700  INFO todo: User store = mongodb://localhost:27017/users[userList]
22:08:30.701  INFO todo: Use URL http://127.0.0.1:8080. CTRL + C to shutdown.
22:08:30.727  INFO todo: Log User List: (module=user-list)
    user-list-spfd:
    Idx  Email                     DB Name                                            Views
    ---  -----                     -------                                            -----
    0    junk@gmail.com            ds039007.mongolab.com:39007/2ndnewishdn            0
    1    frank@example.com         ds047057.mongolab.com:47057/frankstodos            0
    2    yodercode@gmail.com       ds049467.mongolab.com:49467/bobstodos              0
    3    nyoder@hudsonsailing.org  ds045137.mongolab.com:45137/todo-000               0
    4    henrikgruett@gmail.com    ds047095.mongolab.com:47095/todos-001              0
    5    murtaza478@gmail.com      ds051980.mongolab.com:51980/todo-002               0
    6    UNASSIGNED_DB             ds037165.mongolab.com:37165/todos-003              0
    7    UNASSIGNED_DB             ds045907.mlab.com:45907/test-todo                  0
    8    yoderm01@gmail.com        mongodb://localhost:27017/yoderm01                 0
    9    bob@example.com           mongodb://localhost:27017/bobstodos                0
    10   test@example.com          mongodb://localhost:27017/test-todo                0
```

## Deprecated: Create new DBs to be assigned to users:
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
% now alias rm reminders
% now alias set https://reminders-kevovklwel.now.sh reminders
```
