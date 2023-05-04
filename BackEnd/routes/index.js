
import loginRoutes from "./login.js"
import privateRoutes from "./private.js"
import profileRoutes from "./profile.js"
import feedRoutes from "./feed.js"
const constructorMethod = (app) => {
    app.use("/", loginRoutes)
    app.use("/profile", profileRoutes )
    app.use("/feed", feedRoutes)
    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
      });
}

export default constructorMethod