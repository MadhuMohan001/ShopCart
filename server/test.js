import { mongoose } from "mongoose";

mongoose.connect("mongodb+srv://madhuchowdary220_db_user:GwKSYy5I811BvnwT@cluster0.rs4arh9.mongodb.net/shopcart?retryWrites=true&w=majority")
.then(() => {
    console.log("DB Connected Successfully");
    process.exit();
})
.catch((err) => {
    console.log("Connection Error:", err);
});
