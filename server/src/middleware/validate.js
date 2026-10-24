export default function validate(schema) {
    return function (req, res, next) {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(result.error);
        }

        req.body = result.data;

        next();
    };
}