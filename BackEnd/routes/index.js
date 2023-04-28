import homeRoutes from "./home.js"
import loginRoutes from "./login.js"

const constructorMethod = (app) => {
    app.use("/", homeRoutes)
    app.use("/", loginRoutes)

    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
      });
}

export default constructorMethod