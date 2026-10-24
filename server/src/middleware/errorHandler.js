export function errorHandler(err, req, res, next) {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error.";

    // Handle Zod validation errors
    if (err.name === "ZodError") {
        statusCode = 400;
        message = "Validation failed";

        return res.status(statusCode).json({
            success: false,
            message,
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }

    // Handle PostgreSQL errors
    if (err.code === "23505") {
        statusCode = 409;
        message = "A record with this information already exists.";
    } else if (err.code === "23503") {
        statusCode = 400;
        message = "Referenced record does not exist or cannot be removed.";
    } else if (err.code === "23502") {
        statusCode = 400;
        message = "A required field is missing.";
    } else if (err.code === "22P02") {
        statusCode = 400;
        message = "Invalid input format.";
    }

    // Hide internal error details
    if (statusCode >= 500) {
        message = "Internal server error.";
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
}