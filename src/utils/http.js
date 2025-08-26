export const ok     = (res, data = {}, message = 'OK')        => res.status(200).json({ success: true, message, ...data });
export const created= (res, data = {}, message = 'Created')   => res.status(201).json({ success: true, message, ...data });
export const noContent = (res)                                => res.status(204).send();

export const fail = (res, status = 400, message = 'Bad Request', extras = {}) =>
  res.status(status).json({ success: false, message, ...extras });