import homeRoutes from "./home.js"

const constructorMethod = (app) => {
    app.use("/", homeRoutes);
    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
      });
}

export default constructorMethod