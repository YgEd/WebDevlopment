<<<<<<< HEAD
// import postRoutes from "./posts.js"
// import userRoutes from "./users.js"
// import groupRoutes from "./groups.js"
import loginRoutes from "./login.js"
const constructorMethod = (app) => {
    // app.use("/posts", bandRoutes);

    // app.use("/users", albumRoutes);

    // app.use("/groups", albumRoutes);
    app.use("/authen", loginRoutes)

=======
import homeRoutes from "./home.js"

const constructorMethod = (app) => {
    app.use("/", homeRoutes);
>>>>>>> suneedhi
    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
      });
}

export default constructorMethod