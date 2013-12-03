### [UBB](http://www.ubbcentral.com/) Forum post-migration url redirector

Quick and dirty solution to redirect my migrated [UBB](http://www.ubbcentral.com/) forum Topics/Forums/Users URLs to [NodeBB](http://nodebb.org/) ids.
it can be used to anything other __target__ forum, doesn't have to be [NodeBB](http://nodebb.org/), but the __source__ forum must be [UBB](http://www.ubbcentral.com/).

### Map

You must create/generate a map of the __source__ topics/forums/users ids, each will map to either ids or slugs of the __target__ forum software you will be using.
If you decide to migrate to NodeBB, use the migrator linked below, which will make that easy for you, otherwise, I'll let you figure that out,
but your map must look like the [map.sample.json](map.sample.json) in structure. Look at the [source](server.js) if you're curious, it's not as bad as you think.

### Install

```bash

npm install ubb-redirector
cd node_modules/ubb-redirector
# or you can clone it directly from here
git clone https://github.com/akhoury/ubb-redirector.git
cd ubb-director

# install dependencies
npm install

# I would use 'forever' or 'supervisor' to keep it running
sudo npm install -g forever

forever -o out.log ubbredirector.js --map="map.sample.json" --port=3000 --host=127.0.0.1 --verbose

# or simply, for a quick demo, and it will default to values used one line above. minus the -v flag :)
node ubbredirector.js  -v

```

### Required Nginx setup

see [nginx.example.com](nginx.example.com) to view an example on the setup I needed,
basically the old UBB forum lived under example.com/forums, so I have a location /forums directive in
 nginx to handle all request into that, which just proxies the requests to ubb-redirector for it to handle the logic

### UBB Version
    7.5.7

### Migrator?

if you want to migrate to [NodeBB](http://nodebb.org/) give this [nodebb-plugin-ubbmigrator](https://github.com/akhoury/nodebb-plugin-ubbmigrator) a shot.
I also added [nginx.forums.example.com](nginx.forums.example.com) which proxies the requests to NodeBB's process.