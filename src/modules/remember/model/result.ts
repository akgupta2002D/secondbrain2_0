export type ResultOk<T> = { kind: 'ok'; value: T }
export type ResultErr<E> = { kind: 'err'; error: E }

export type Result<T, E> = ResultOk<T> | ResultErr<E>

export const ok = <T,>(value: T): ResultOk<T> => ({ kind: 'ok', value })
export const err = <E,>(error: E): ResultErr<E> => ({ kind: 'err', error })

