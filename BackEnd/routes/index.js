// import postRoutes from "./posts.js"
// import userRoutes from "./users.js"
// import groupRoutes from "./groups.js"
import loginRoutes from "./login.js"
const constructorMethod = (app) => {
    // app.use("/posts", bandRoutes);

    // app.use("/users", albumRoutes);

    // app.use("/groups", albumRoutes);
    app.use("/authen", loginRoutes)

    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
      });
}

export default constructorMethod