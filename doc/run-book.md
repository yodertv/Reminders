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
NODE_ENV={production|dev}
MONGO_USER_DB_NAME=<UserDataBaseStore>
MONGO_USER=<dbUserName>
MONGO_USER_SECRET=<dbUserSecret>
GOOGLE_CLIENT_SECRET=<googleClientSecret>
GOOGLE_CLIENT_ID=<googleClientId>
LOG_LEVEL={fatal|error|warn|info|debug|trace}
```
The MONGO variables apply to the MONGO_USER_DB_NAME.
The MONGO_USER_DB_NAME is the database for the user index collection, userList, which relates each user with the name of their mongo db name of the users Todo's. Each user has a db for their reminders. New users will be allocated new DBs on the same database server as MONGO_USER_DB_NAME.
The GOOGLE api variables are used for OAuth when NODE_ENV=production.
NODE_ENV=production only works in 127.0.0.1 and cloud deployment.
LOG_LEVEL is the level from bunyan logger to log at and above.

## Testing google auth on localhost

At your identity provider, [google](http://console.cloud.google.com/) in my case, create a client_id and client_secret to allow passport to use the GoogleStrategy with passport. Add callbackURL to Authorized redirect URIs in Google API Console.

Use build_prop.localhost.json and set the NODE_ENV to production to test google auth locally.
If you get the google auth button when NODE_ENV isn't production, check that you are using the correct url for your deployment.

```
% export NODE_ENV=production
% npm run build --silent localhost 
% node main.js | bunyan --output oneline
[dotenv@16.4.5][DEBUG] No encoding is specified. UTF-8 is used by default
19:16:08.363Z TRACE todo: Logging level set to 10 .
19:16:08.364Z  INFO todo: Todo Server v0.7.1 running on Mikes-Air.local:8080. Node environment = PROD.
19:16:08.364Z  INFO todo: User store = localhost:27017/users[userList]
19:16:08.364Z  INFO todo: Use URL http://localhost:8080. CTRL + C to shutdown.
Server is running on port 8080
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
