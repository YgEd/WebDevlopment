
import loginRoutes from "./login.js"
import privateRoutes from "./private.js"
import profileRoutes from "./profile.js"
import postRoutes from "./posts.js"
import feedRoutes from "./feed.js"
import recommendationRoutes from "./recommendations.js"
import searchRoutes from "./search.js"
import groupRoutes from "./groups.js"


const constructorMethod = (app) => {
    app.use("/", loginRoutes)
    app.use("/profile", profileRoutes )
    app.use("/feed", feedRoutes)
    app.use("/posts", postRoutes )
    app.use("/recommendation", recommendationRoutes)
    app.use("/search", searchRoutes)
    app.use("/groups", groupRoutes)

    app.use('*', (req, res) => {
        res.status(404).render('not_found', {title: "Page Not Found"})
      });
}

export default constructorMethod