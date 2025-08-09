import app from "./app.js";
import { PORT } from "./utils/constants.js";

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});