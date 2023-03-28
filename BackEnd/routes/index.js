import postRoutes from "./posts.js"
import userRoutes from "./users.js"
import groupRoutes from "./groups.js"

const constructorMethod = (app) => {
    app.use("/posts", bandRoutes);

    app.use("/users", albumRoutes);

    app.use("/groups", albumRoutes);


    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
      });
}

export default constructorMethod