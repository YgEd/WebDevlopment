
import loginRoutes from "./login.js"
import profileRoutes from "./profile.js"

const constructorMethod = (app) => {
    app.use("/", loginRoutes)
    app.use("/profile", profileRoutes )

    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
      });
}

export default constructorMethod