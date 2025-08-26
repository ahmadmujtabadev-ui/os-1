export default function validate(schema, where = 'body') {
    return (req, res, next) => {
        const src = req[where] || {};
        const { error, value } = schema.validate(src, { abortEarly: false, stripUnknown: true });
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(d => d.message),
            });
        }
        req[where] = value;
        next();
    };
}