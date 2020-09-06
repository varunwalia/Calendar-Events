const Event = require('../../models/event');
const User = require('../../models/user');
const { resolveFieldValueOrError } = require('graphql/execution/execute');
var ObjectId = require('mongodb').ObjectID;


module.exports = {
  events: (args , req) => {
    return Event.find({creator: ObjectId(req.userId)} ).then(rows=>rows).catch(err=> {throw err})
  },
  
  createEvent: async (args, req) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      date: new Date(args.eventInput.date),
      startTime: new Date(args.eventInput.date+"T"+args.eventInput.startTime),
      endTime: new Date(args.eventInput.date+"T"+args.eventInput.endTime),
      creator: ObjectId(req.userId)
    });
    // YYYY-mm-ddTHH:MM:ss
//     console.log(event)
    try {
      const today = new Date();
      if (event.startTime < today || event.startTime>=event.endTime ){
        throw new Error("You cannot assign events in the past")
      }
      // const creator = await User.findById(req.userId); // Use this for authentication purpose
      const creator = await User.findById(req.userId);  
      if (!creator) {
        throw new Error('User not found.');
      }
      let flag=true;
  
      const res = await Event.find({ creator: ObjectId( req.userId), date: new Date(event.date)})
//       console.log(res)
      const newStart = event.startTime; 
      const newEnd = event.endTime;  
      for (let i=0;i<res.length;i++)
      {
        if ((res[i].startTime===newEnd) || (res[i].endTime===newStart)){
          flag=false;
          break
        }
        else if ((newStart>=res[i].startTime && newStart<=res[i].endTime) 
                || (newEnd <= res[i].startTime && newEnd>=res[i].startTime)) {   
            flag=false;
            break;
          }
        else if (newStart<=res[i].startTime && newEnd>=res[i].endTime)
        {
          flag=false;
          break;
        }
      }
      if (!flag){
        throw new Error("Event Collision")
      }
      creator.createdEvents.push(event);
      const result = await event.save();
      await creator.save();
      return result
    }
    catch (err) {
      // console.log(err);
      throw err;
    }
  },

  deleteEvent: async ({eventId},req) => {
    try {
      const result = await Event.findById(eventId);
      await Event.deleteOne({_id: eventId});
      return result
    }
    catch (err){
      throw err;
    }
  }
};
