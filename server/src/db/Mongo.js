// @flow
import { MongoClient } from 'mongodb'
import config from '../../config'

class Mongo {
  database = null

  connect = async () => MongoClient.connect(
    config.db.url,
    config.db.options,
    (err: Error, client: Object): void => {
      if (err) {
        console.error(err)
      } else {
        this.database = client.db(config.db.dbName)
        process.on('exit', () => {
          client.close()
        })
      }
    },
  );

  getCollection = (collectionName: string): Object => {
    return this.database.collection(collectionName)
  }
}

const mongo = new Mongo()

export default mongo
