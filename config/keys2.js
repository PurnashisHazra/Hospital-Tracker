dbPassword1 = 'mongodb+srv://yesmaam:' + encodeURIComponent('Htcdesireu@1!') + '@cluster0-lhecz.mongodb.net/hospitals?retryWrites=true&w=majority';
//mongodb + srv://yesmaam:<password>@cluster0-lhecz.mongodb.net/test?retryWrites=true&w=majority

module.exports = {
    mongoURI: dbPassword1
};

//mongoimport--host Cluster0 - shard - 0 / cluster0 - shard - 00 - 00 - lhecz.mongodb.net: 27017, cluster0 - shard - 00 - 01 - lhecz.mongodb.net: 27017, cluster0 - shard - 00 - 02 - lhecz.mongodb.net: 27017 --ssl--username yesmaam--password Htcdesireu%401%21 --authenticationDatabase admin--db hospitals --collection hospitals --type CSV --file C:\Users\Batman\Documents\hospdata.csv

