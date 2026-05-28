import Fluent
import FluentSQLiteDriver
import Leaf
import Redis
import Vapor

public func configure(_ app: Application) async throws {
    app.directory.viewsDirectory = app.directory.workingDirectory + "Views/"

    app.middleware.use(FileMiddleware(publicDirectory: app.directory.publicDirectory))
    app.views.use(.leaf)

    app.databases.use(.sqlite(.file("db.sqlite")), as: .sqlite)

    let redisHostname = Environment.get("REDIS_HOSTNAME") ?? "localhost"
    app.redis.configuration = try RedisConfiguration(hostname: redisHostname)

    app.migrations.add(CreateCategory())
    app.migrations.add(CreateSupplier())
    app.migrations.add(CreateProduct())

    try routes(app)
}
