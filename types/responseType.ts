export interface Result<T> {
    resultCode: string;
    resultData: T;
    resultMessage: string;
    status: string;
}
