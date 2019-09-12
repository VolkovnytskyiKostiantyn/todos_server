module.exports = {
  db: {
    url: process.env.MONGO_URL || 'mongodb+srv://1:2@mymongodbcluster-mwueg.mongodb.net/test?retryWrites=true&w=majority',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    dbName: 'todos'
  }
}
