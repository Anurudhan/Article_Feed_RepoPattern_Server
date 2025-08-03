import app from "./app";
import { envVaribales } from "./config/env_Variables";
import  connectDB  from "./utils/db";

const PORT = envVaribales.PORT;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
