const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const cron = require("node-cron");
const cors = require('cors');

const Event = require('./models/event');

// var ObjectId = require('mongodb').ObjectID;


const graphQlSchema = require('./graphql/schema/schema');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');



const app = express();

app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use(isAuth);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);


//cron job to check and delete the expired events
cron.schedule("* */20 * * *", async () =>  {
  console.log("checking for expired evets after every 20 hours");
  let date = new Date()
  // output = await Event.deleteOne({_id: ObjectId("5f50e83f220a1659b576fce9")});
  output = await Event.deleteMany({date: {$lt: new Date()}}) 
  console.log("expired events deleted successfully");
});


mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@sandbox.qayhg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
  )
  .then(() => {
    app.listen(8000,()=>{
        console.log("Running on port 8000")
    });
  })
  .catch(err => {
    console.log(err);
  });
