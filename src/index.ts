import app from "./app";
import  connectDB  from "./utils/db";

const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
