const Event = require('../../models/event');
const User = require('../../models/user');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
  events: (args , req) => {
    return Event.find({creator: ObjectId("5f507ab7ec12d23c77dce6d6")} ).then(rows=>rows).catch(err=> {throw err})
    // Use this for authentication purpose
    // return Event.find({creator: req.userId} ).then(rows=>rows).catch(err=> {throw err})

  },
  
  createEvent: async (args, req) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      date: new Date(args.eventInput.date),
      startTime: new Date(args.eventInput.date+"T"+args.eventInput.startTime),
      endTime: new Date(args.eventInput.date+"T"+args.eventInput.endTime),
      creator: ObjectId("5f507ab7ec12d23c77dce6d6")
    });
    // YYYY-mm-ddTHH:MM:ss
    let createdEvent;
    try {
      const today = new Date();
      if (event.startTime < today || event.startTime>=event.endTime ){
        throw new Error("You cannot assign events in the past")
      }
      // const creator = await User.findById(req.userId); // Use this for authentication purpose
      const creator = await User.findById("5f507ab7ec12d23c77dce6d6");  
      if (!creator) {
        throw new Error('User not found.');
      }
      let flag=true;
      const eventsForDay = await Event.find({ creator: ObjectId("5f507ab7ec12d23c77dce6d6"),
       date: new Date(args.eventInput.date)} , (err,res)=>{
        if (err) {
          throw err;
        }
        const newStart = event.startTime; 
        const newEnd = event.endTime;  
        res.forEach(event => {
          if ((event.startTime===newEnd) || (event.endTime===newStart)){
            // console.log(event)
            flag=false;
          }
          else if ((newStart>=event.startTime && newStart<=event.endTime) 
                  || (newEnd <= event.startTime && newEnd>=event.startTime)) {
              // console.log(event)
              flag=false;
            }
          else if (newStart<=event.startTime && newEnd>=event.endTime)
          {
            // console.log(event)
            flag=false;
          }
        })
      })
      // console.log(flag)
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
