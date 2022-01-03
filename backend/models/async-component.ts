export abstract class AsyncComponent {
    public static implementedBy(object: any): boolean {
        return object && object.asyncInit && typeof object.asyncInit === typeof function() { return Promise.resolve() };
    }
    abstract asyncInit(): Promise<void>;
    abstract getClassRef(): { name: string };
}